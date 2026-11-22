import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import { getFirestore, collection, doc, getDocs, limit, orderBy, query, runTransaction, serverTimestamp, Timestamp, updateDoc, writeBatch } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = getApps().some(item => item.name === "sijil-license") ? getApp("sijil-license") : initializeApp(firebaseConfig, "sijil-license");
const clientApp = getApps().some(item => item.name === "[DEFAULT]") ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const clientAuth = getAuth(clientApp);
const clientDb = getFirestore(clientApp);
export const ADMIN_EMAIL = "ali.pash14400@gmail.com";
const LICENSE_TERM_DAYS = 365;
function getLicenseExpiry(license) {
  const activationStart = license.activatedAt?.toMillis?.() || Date.now();
  const termDays = Math.min(LICENSE_TERM_DAYS, Number(license.termDays) || LICENSE_TERM_DAYS);
  const maximumExpiry = activationStart + termDays * 24 * 60 * 60 * 1000;
  return license.expiresAt?.toMillis?.() <= maximumExpiry ? license.expiresAt : Timestamp.fromMillis(maximumExpiry);
}
function expiredLicenseMessage(license) {
  return Number(license?.termDays) === 1
    ? "انتهت صلاحية الكود التجريبي بعد 24 ساعة من أول تفعيل."
    : "انتهت صلاحية هذا الكود بعد مرور سنة على تفعيله.";
}

export function getClientUser() { return clientAuth.currentUser || window.SijilAccount?.getCurrentUser?.() || null; }
export function waitForClientAuth() {
  return new Promise(resolve => {
    let unsubscribe;
    unsubscribe = onAuthStateChanged(clientAuth, user => { if (unsubscribe) unsubscribe(); resolve(user); });
  });
}
export function onClientAuthChanged(callback) { return onAuthStateChanged(clientAuth, callback); }

export function normalizeCode(value) { return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }
export async function hashCode(value) {
  const bytes = new TextEncoder().encode(normalizeCode(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}
export function newCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
  return "SG-" + hex.match(/.{4}/g).join("-");
}
function requireAdmin() {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL || !auth.currentUser.emailVerified) {
    throw new Error("سجّل الدخول بحساب المسؤول الموثّق.");
  }
}

export async function activateCode(code, deviceId, productId = "grades") {
  const user = getClientUser();
  if (!user || !user.uid || !user.email) throw new Error("سجّل الدخول أو أنشئ حسابًا قبل تفعيل الكود.");
  const teacherName = String(user.displayName || "").trim().slice(0, 80);
  if (!teacherName) throw new Error("أدخل اسم المدرس/ة واحفظه في نافذة الحساب قبل تفعيل الكود.");
  const normalized = normalizeCode(code);
  if (!/^SG[A-F0-9]{32}$/.test(normalized)) throw new Error("تحقق من كتابة الكود وحاول مجددًا.");
  const codeHash = await hashCode(normalized), ref = doc(clientDb, "licenses", codeHash);
  let expiresAtMillis = 0;
  let termDays = LICENSE_TERM_DAYS;
  await runTransaction(clientDb, async transaction => {
    const snap = await transaction.get(ref);
    if (!snap.exists()) throw new Error("الكود غير صحيح.");
    const license = snap.data();
    termDays = Math.min(LICENSE_TERM_DAYS, Number(license.termDays) || LICENSE_TERM_DAYS);
    if (license.status !== "active") throw new Error("هذا الكود موقوف. تواصل مع مسؤول التطبيق.");
    if ((license.productId || "grades") !== productId) throw new Error("هذا الكود مخصص لتطبيق آخر.");
    if (license.accountUid && license.accountUid !== user.uid) throw new Error("هذا الكود مرتبط بحساب آخر. تواصل مع مسؤول التطبيق.");
    if (license.deviceId && license.deviceId !== deviceId) throw new Error("هذا الكود مفعّل على جهاز آخر.");
    const expiresAt = getLicenseExpiry(license);
    expiresAtMillis = expiresAt.toMillis();
    if (expiresAtMillis <= Date.now()) throw new Error(expiredLicenseMessage(license));
    transaction.update(ref, {
      deviceId,
      activatedAt: license.activatedAt || serverTimestamp(),
      expiresAt,
      accountUid: user.uid,
      accountEmail: user.email,
      accountTeacherName: teacherName
    });
  });
  return { version: 2, productId, termDays, codeHash, deviceId, accountUid: user.uid, accountEmail: user.email, accountTeacherName: teacherName, expiresAt: expiresAtMillis };
}

export async function verifyActivation(saved) {
  const user = getClientUser();
  if (!user || !saved || ![1, 2].includes(saved.version) || !/^[a-f0-9]{64}$/.test(saved.codeHash || "") || !/^[a-zA-Z0-9-]{20,80}$/.test(saved.deviceId || "")) return false;
  if (saved.accountUid && saved.accountUid !== user.uid) return false;
  const teacherName = String(user.displayName || saved.accountTeacherName || "").trim().slice(0, 80);
  if (!teacherName) return false;
  const ref = doc(clientDb, "licenses", saved.codeHash);
  return runTransaction(clientDb, async transaction => {
    const snap = await transaction.get(ref);
    if (!snap.exists()) return false;
    const license = snap.data();
    if (license.status !== "active" || (license.productId || "grades") !== (saved.productId || "grades") || license.deviceId !== saved.deviceId || license.accountUid !== user.uid) return false;
    const expiresAt = license.activatedAt ? getLicenseExpiry(license) : null;
    if (!expiresAt) return false;
    if (expiresAt.toMillis() <= Date.now()) throw new Error(expiredLicenseMessage(license));
    const updates = {};
    if (!license.expiresAt || license.expiresAt.toMillis() !== expiresAt.toMillis()) updates.expiresAt = expiresAt;
    if (license.accountEmail !== user.email) updates.accountEmail = user.email;
    if (license.accountTeacherName !== teacherName) updates.accountTeacherName = teacherName;
    if (Object.keys(updates).length) {
      transaction.update(ref, updates);
    }
    saved.expiresAt = expiresAt.toMillis();
    saved.termDays = Math.min(LICENSE_TERM_DAYS, Number(license.termDays) || LICENSE_TERM_DAYS);
    return true;
  });
}

export async function linkActivationAccount(saved) {
  const user = getClientUser();
  if (!user || !user.uid || !user.email) throw new Error("سجّل الدخول إلى حسابك لربط كود التفعيل به.");
  const teacherName = String(user.displayName || "").trim().slice(0, 80);
  if (!teacherName) throw new Error("أدخل اسم المدرس/ة واحفظه في نافذة الحساب قبل ربط الكود.");
  if (!saved || !/^[a-f0-9]{64}$/.test(saved.codeHash || "") || !/^[a-zA-Z0-9-]{20,80}$/.test(saved.deviceId || "")) throw new Error("بيانات التفعيل المحفوظة غير صالحة.");
  const ref = doc(clientDb, "licenses", saved.codeHash);
  await runTransaction(clientDb, async transaction => {
    const snap = await transaction.get(ref);
    if (!snap.exists()) throw new Error("لم نعثر على كود التفعيل المحفوظ.");
    const license = snap.data();
    if (license.status !== "active" || license.deviceId !== saved.deviceId) throw new Error("هذا التفعيل لم يعد صالحًا على هذا الجهاز.");
    if ((license.productId || "grades") !== (saved.productId || "grades")) throw new Error("هذا الكود مخصص لتطبيق آخر.");
    if (license.accountUid && license.accountUid !== user.uid) throw new Error("هذا الكود مرتبط بحساب آخر. تواصل مع مسؤول التطبيق.");
    const expiresAt = getLicenseExpiry(license);
    if (expiresAt.toMillis() <= Date.now()) throw new Error(expiredLicenseMessage(license));
    transaction.update(ref, { accountUid: user.uid, accountEmail: user.email, accountTeacherName: teacherName, activatedAt: license.activatedAt || serverTimestamp(), expiresAt });
    saved.expiresAt = expiresAt.toMillis();
    saved.termDays = Math.min(LICENSE_TERM_DAYS, Number(license.termDays) || LICENSE_TERM_DAYS);
  });
  return { version: 2, productId: saved.productId || "grades", termDays: saved.termDays || LICENSE_TERM_DAYS, codeHash: saved.codeHash, deviceId: saved.deviceId, accountUid: user.uid, accountEmail: user.email, accountTeacherName: teacherName, expiresAt: saved.expiresAt };
}

export async function createCodes(count, label, productId = "grades", termDays = LICENSE_TERM_DAYS) {
  requireAdmin();
  if (!Number.isInteger(count) || count < 1 || count > 100) throw new Error("يمكن إنشاء 1 إلى 100 كود في المرة الواحدة.");
  if (!["grades", "study-planner", "asillati-exam"].includes(productId)) throw new Error("نوع التطبيق غير صالح.");
  if (![1, LICENSE_TERM_DAYS].includes(Number(termDays))) throw new Error("مدة الكود غير صالحة.");
  termDays = Number(termDays);
  const batch = writeBatch(db), generated = [];
  for (let index = 0; index < count; index++) {
    const code = newCode(), codeHash = await hashCode(code);
    batch.set(doc(db, "licenses", codeHash), { status: "active", productId, priceIQD: termDays === 1 ? 0 : 5000, termDays, expiresAt: null, label: String(label || "").trim().slice(0, 80), deviceId: null, accountUid: null, accountEmail: null, accountTeacherName: null, activatedAt: null, createdAt: serverTimestamp() });
    generated.push(code);
  }
  await batch.commit();
  return generated;
}

export async function listCodes(productId = "grades", termDays = null) {
  requireAdmin();
  const result = await getDocs(query(collection(db, "licenses"), orderBy("createdAt", "desc"), limit(500)));
  return result.docs.map(item => ({ id: item.id, ...item.data() })).filter(item =>
    (productId == null || (item.productId || "grades") === productId) &&
    (termDays == null || Number(item.termDays || LICENSE_TERM_DAYS) === Number(termDays))
  );
}
export async function setCodeStatus(codeHash, status) {
  requireAdmin();
  if (!/^[a-f0-9]{64}$/.test(codeHash) || !["active", "revoked"].includes(status)) throw new Error("طلب غير صالح.");
  await updateDoc(doc(db, "licenses", codeHash), { status });
}
export async function resetCodeDevice(codeHash) {
  requireAdmin();
  if (!/^[a-f0-9]{64}$/.test(codeHash)) throw new Error("طلب غير صالح.");
  await updateDoc(doc(db, "licenses", codeHash), { deviceId: null });
}
export async function resetCodeAccount(codeHash) {
  requireAdmin();
  if (!/^[a-f0-9]{64}$/.test(codeHash)) throw new Error("طلب غير صالح.");
  await updateDoc(doc(db, "licenses", codeHash), { deviceId: null, accountUid: null, accountEmail: null, accountTeacherName: null });
}
export async function deleteCodes(codeHashes) {
  requireAdmin();
  const uniqueHashes = [...new Set(codeHashes)];
  if (!uniqueHashes.length || uniqueHashes.length > 500 || uniqueHashes.some(codeHash => !/^[a-f0-9]{64}$/.test(codeHash))) {
    throw new Error("حدد من 1 إلى 500 كود صالح للحذف.");
  }
  const batch = writeBatch(db);
  for (const codeHash of uniqueHashes) batch.delete(doc(db, "licenses", codeHash));
  await batch.commit();
}
export function signInAdmin() {
  // Start the popup synchronously from the user's click; Safari may drop the
  // user-gesture permission if an awaited persistence call runs first.
  return signInWithPopup(auth, new GoogleAuthProvider()).then(async credential => {
    if (credential.user.email !== ADMIN_EMAIL || !credential.user.emailVerified) {
      await signOut(auth);
      throw new Error("هذا الحساب غير مخوّل لإدارة الأكواد.");
    }
    return credential.user;
  });
}
export async function logoutAdmin() { return signOut(auth); }

window.SijilLicenseCloud = { activateCode, verifyActivation };
window.dispatchEvent(new Event("sijil-license-cloud-ready"));
