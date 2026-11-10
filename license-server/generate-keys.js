"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const privateDir = path.join(__dirname, "private");
const privatePath = path.join(privateDir, "license-private-key.pem");
const privateB64Path = path.join(privateDir, "license-private-key.b64");
const publicPath = path.join(__dirname, "..", "license-public-key.pem");

if (fs.existsSync(privatePath) || fs.existsSync(publicPath)) {
  throw new Error("A key already exists. Keep it, or move both existing keys aside before generating a replacement.");
}

fs.mkdirSync(privateDir, { recursive: true });
const pair = crypto.generateKeyPairSync("rsa", {
  modulusLength: 3072,
  publicExponent: 65537,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" }
});
fs.writeFileSync(privatePath, pair.privateKey, { mode: 0o600 });
fs.writeFileSync(privateB64Path, Buffer.from(pair.privateKey, "utf8").toString("base64"), { mode: 0o600 });
fs.writeFileSync(publicPath, pair.publicKey, { mode: 0o644 });
console.log("Created a signing key pair. The private key is ignored by Git; keep it backed up securely.");
