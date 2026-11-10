"use strict";

const http = require("node:http");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const PORT = Number(process.env.PORT || 10000);
const APP_ORIGIN = String(process.env.APP_ORIGIN || "").replace(/\/$/, "");
const ADMIN_KEY = String(process.env.ADMIN_KEY || "");
const PRIVATE_KEY_B64 = String(process.env.LICENSE_PRIVATE_KEY_B64 || "");
const ADMIN_HTML = path.join(__dirname, "admin.html");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
const failedActivationAttempts = new Map();

if (!process.env.DATABASE_URL || !ADMIN_KEY || !PRIVATE_KEY_B64 || !APP_ORIGIN) {
  throw new Error("Set DATABASE_URL, ADMIN_KEY, LICENSE_PRIVATE_KEY_B64, and APP_ORIGIN before starting.");
}

const privateKey = crypto.createPrivateKey(Buffer.from(PRIVATE_KEY_B64, "base64").toString("utf8"));
const publicKey = crypto.createPublicKey(privateKey);

function send(res, status, data, extraHeaders = {}) {
  const body = typeof data === "string" ? data : JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": typeof data === "string" ? "text/html; charset=utf-8" : "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    ...extraHeaders
  });
  res.end(body);
}

function setCors(req, res) {
  const origin = req.headers.origin;
  if (!origin) return true;
  if (origin.replace(/\/$/, "") !== APP_ORIGIN && origin !== `https://${req.headers.host}`) return false;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "600");
  return true;
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 32768) {
        reject(Object.assign(new Error("Request too large"), { status: 413 }));
        req.destroy();
      }
    });
    req.on("end", () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(Object.assign(new Error("Invalid JSON"), { status: 400 })); }
    });
    req.on("error", reject);
  });
}

function requireAdmin(req) {
  const supplied = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const expectedBuffer = Buffer.from(ADMIN_KEY);
  const suppliedBuffer = Buffer.from(supplied);
  return suppliedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(suppliedBuffer, expectedBuffer);
}

function normalizedCode(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function hashCode(value) {
  return crypto.createHash("sha256").update(normalizedCode(value), "utf8").digest("hex");
}

function generateCode() {
  const hex = crypto.randomBytes(16).toString("hex").toUpperCase();
  return "SG-" + hex.match(/.{1,4}/g).join("-");
}

function makeReceipt(licenseId, deviceId) {
  const payload = Buffer.from(JSON.stringify({ version: 1, licenseId, deviceId, issuedAt: new Date().toISOString() }), "utf8");
  return { receipt: payload.toString("base64url"), signature: crypto.sign("RSA-SHA256", payload, privateKey).toString("base64url") };
}

function verifyReceipt(receipt, signature) {
  try {
    const payloadBytes = Buffer.from(String(receipt || ""), "base64url");
    const signatureBytes = Buffer.from(String(signature || ""), "base64url");
    const payload = JSON.parse(payloadBytes.toString("utf8"));
    const valid = crypto.verify("RSA-SHA256", payloadBytes, publicKey, signatureBytes);
    return valid ? payload : null;
  } catch { return null; }
}

function validDeviceId(value) {
  return /^[a-zA-Z0-9-]{20,80}$/.test(String(value || ""));
}

function limitActivation(req) {
  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
  const now = Date.now();
  const recent = (failedActivationAttempts.get(ip) || []).filter(time => now - time < 10 * 60 * 1000);
  if (recent.length >= 12) return false;
  recent.push(now);
  failedActivationAttempts.set(ip, recent);
  if (failedActivationAttempts.size > 5000) failedActivationAttempts.clear();
  return true;
}

async function activate(req, res) {
  if (!limitActivation(req)) return send(res, 429, { error: "محاولات كثيرة. انتظر قليلًا ثم أعد المحاولة." });
  const body = await readJson(req);
  const code = normalizedCode(body.code);
  const deviceId = String(body.deviceId || "");
  if (!/^SG[A-F0-9]{32}$/.test(code) || !validDeviceId(deviceId)) return send(res, 400, { error: "تحقق من كتابة الكود وحاول مجددًا." });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const found = await client.query("SELECT id, device_id, revoked_at FROM licenses WHERE code_hash = $1 FOR UPDATE", [hashCode(code)]);
    if (!found.rowCount) {
      await client.query("ROLLBACK");
      return send(res, 404, { error: "الكود غير صحيح." });
    }
    const license = found.rows[0];
    if (license.revoked_at) {
      await client.query("ROLLBACK");
      return send(res, 403, { error: "هذا الكود موقوف. تواصل مع مسؤول التطبيق." });
    }
    if (license.device_id && license.device_id !== deviceId) {
      await client.query("ROLLBACK");
      return send(res, 409, { error: "هذا الكود مفعّل على جهاز آخر." });
    }
    await client.query(
      "UPDATE licenses SET device_id = $2, activated_at = COALESCE(activated_at, NOW()), last_check_at = NOW() WHERE id = $1",
      [license.id, deviceId]
    );
    await client.query("COMMIT");
    return send(res, 200, makeReceipt(license.id, deviceId));
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally { client.release(); }
}

async function checkLicense(req, res) {
  const body = await readJson(req);
  const payload = verifyReceipt(body.receipt, body.signature);
  if (!payload || payload.version !== 1 || !validDeviceId(payload.deviceId) || !payload.licenseId) {
    return send(res, 401, { error: "التفعيل المحلي غير صالح." });
  }
  const result = await pool.query(
    "UPDATE licenses SET last_check_at = NOW() WHERE id = $1 AND device_id = $2 AND revoked_at IS NULL RETURNING id",
    [payload.licenseId, payload.deviceId]
  );
  if (!result.rowCount) return send(res, 403, { error: "هذا التفعيل لم يعد صالحًا. أدخل كودًا صالحًا." });
  return send(res, 200, makeReceipt(payload.licenseId, payload.deviceId));
}

async function adminRoute(req, res, url) {
  if (!requireAdmin(req)) return send(res, 401, { error: "مفتاح المسؤول غير صحيح." });
  if (req.method === "GET" && url.pathname === "/api/admin/licenses") {
    const result = await pool.query(
      "SELECT id, label, created_at, activated_at, device_id, revoked_at FROM licenses ORDER BY created_at DESC LIMIT 1000"
    );
    const licenses = result.rows.map(row => ({
      id: row.id,
      label: row.label,
      createdAt: row.created_at,
      activatedAt: row.activated_at,
      status: row.revoked_at ? "revoked" : (row.device_id ? "activated" : "unused")
    }));
    return send(res, 200, { licenses });
  }
  if (req.method === "POST" && url.pathname === "/api/admin/licenses") {
    const body = await readJson(req);
    const count = Number(body.count || 1);
    const label = String(body.label || "").trim().slice(0, 120);
    if (!Number.isInteger(count) || count < 1 || count > 200) return send(res, 400, { error: "العدد يجب أن يكون بين 1 و200." });
    const generated = Array.from({ length: count }, () => ({ id: crypto.randomUUID(), code: generateCode() }));
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const item of generated) {
        await client.query("INSERT INTO licenses (id, code_hash, label) VALUES ($1, $2, $3)", [item.id, hashCode(item.code), label]);
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      throw error;
    } finally { client.release(); }
    return send(res, 201, { codes: generated.map(item => ({ id: item.id, code: item.code, label })) });
  }
  const match = /^\/api\/admin\/licenses\/([0-9a-f-]+)\/(revoke|reset-device)$/.exec(url.pathname);
  if (req.method === "POST" && match) {
    const [, id, action] = match;
    const result = action === "revoke"
      ? await pool.query("UPDATE licenses SET revoked_at = COALESCE(revoked_at, NOW()) WHERE id = $1 RETURNING id", [id])
      : await pool.query("UPDATE licenses SET device_id = NULL, activated_at = NULL WHERE id = $1 AND revoked_at IS NULL RETURNING id", [id]);
    if (!result.rowCount) return send(res, 404, { error: "لم يُعثر على الكود أو أنه موقوف." });
    return send(res, 200, { ok: true });
  }
  return send(res, 404, { error: "المسار غير موجود." });
}

async function initialize() {
  await pool.query(`CREATE TABLE IF NOT EXISTS licenses (
    id text PRIMARY KEY,
    code_hash char(64) UNIQUE NOT NULL,
    label text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT NOW(),
    activated_at timestamptz,
    device_id text,
    revoked_at timestamptz,
    last_check_at timestamptz
  )`);
}

async function handler(req, res) {
  if (!setCors(req, res)) return send(res, 403, { error: "مصدر الطلب غير مسموح." });
  if (req.method === "OPTIONS") return send(res, 204, "");
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  try {
    if (req.method === "GET" && url.pathname === "/healthz") return send(res, 200, { ok: true });
    if (req.method === "GET" && (url.pathname === "/admin" || url.pathname === "/admin/")) {
      return send(res, 200, fs.readFileSync(ADMIN_HTML, "utf8"));
    }
    if (req.method === "POST" && url.pathname === "/api/activate") return await activate(req, res);
    if (req.method === "POST" && url.pathname === "/api/license/check") return await checkLicense(req, res);
    if (url.pathname.startsWith("/api/admin/")) return await adminRoute(req, res, url);
    return send(res, 404, { error: "المسار غير موجود." });
  } catch (error) {
    console.error("request failed:", error && error.message ? error.message : "unknown error");
    if (!res.headersSent) send(res, error.status || 500, { error: error.status ? error.message : "تعذر تنفيذ الطلب الآن." });
  }
}

initialize().then(() => {
  http.createServer(handler).listen(PORT, "0.0.0.0", () => console.log(`License API listening on ${PORT}`));
}).catch(error => {
  console.error("database initialization failed:", error.message);
  process.exit(1);
});
