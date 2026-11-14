import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import { getFirestore, collection, doc, getDocFromServer, getDocs, limit, orderBy, query, runTransaction, serverTimestamp, updateDoc, writeBatch } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = getApps().some(item => item.name === "sijil-license") ? getApp("sijil-license") : initializeApp(firebaseConfig, "sijil-license");
export const auth = getAuth(app);
export const db = getFirestore(app);
export const ADMIN_EMAIL = "ali.pash14400@gmail.com";

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

export async function activateCode(code, deviceId) {
  const normalized = normalizeCode(code);
  if (!/^SG[A-F0-9]{32}$/.test(normalized)) throw new Error("تحقق من كتابة الكود وحاول مجددًا.");
  const codeHash = await hashCode(normalized), ref = doc(db, "licenses", codeHash);
  await runTransaction(db, async transaction => {
    const snap = await transaction.get(ref);
    if (!snap.exists()) throw new Error("الكود غير صحيح.");
    const license = snap.data();
    if (license.status !== "active") throw new Error("هذا الكود موقوف. تواصل مع مسؤول التطبيق.");
    if (license.deviceId && license.deviceId !== deviceId) throw new Error("هذا الكود مفعّل على جهاز آخر.");
    if (!license.deviceId) transaction.update(ref, { deviceId, activatedAt: serverTimestamp() });
  });
  return { version: 1, codeHash, deviceId };
}

export async function verifyActivation(saved) {
  if (!saved || saved.version !== 1 || !/^[a-f0-9]{64}$/.test(saved.codeHash || "") || !/^[a-zA-Z0-9-]{20,80}$/.test(saved.deviceId || "")) return false;
  const snap = await getDocFromServer(doc(db, "licenses", saved.codeHash));
  if (!snap.exists()) return false;
  const license = snap.data();
  return license.status === "active" && license.deviceId === saved.deviceId;
}

export async function createCodes(count, label) {
  requireAdmin();
  if (!Number.isInteger(count) || count < 1 || count > 100) throw new Error("يمكن إنشاء 1 إلى 100 كود في المرة الواحدة.");
  const batch = writeBatch(db), generated = [];
  for (let index = 0; index < count; index++) {
    const code = newCode(), codeHash = await hashCode(code);
    batch.set(doc(db, "licenses", codeHash), { status: "active", label: String(label || "").trim().slice(0, 80), deviceId: null, activatedAt: null, createdAt: serverTimestamp() });
    generated.push(code);
  }
  await batch.commit();
  return generated;
}

export async function listCodes() {
  requireAdmin();
  const result = await getDocs(query(collection(db, "licenses"), orderBy("createdAt", "desc"), limit(500)));
  return result.docs.map(item => ({ id: item.id, ...item.data() }));
}
export async function setCodeStatus(codeHash, status) {
  requireAdmin();
  if (!/^[a-f0-9]{64}$/.test(codeHash) || !["active", "revoked"].includes(status)) throw new Error("طلب غير صالح.");
  await updateDoc(doc(db, "licenses", codeHash), { status });
}
export async function resetCodeDevice(codeHash) {
  requireAdmin();
  if (!/^[a-f0-9]{64}$/.test(codeHash)) throw new Error("طلب غير صالح.");
  await updateDoc(doc(db, "licenses", codeHash), { deviceId: null, activatedAt: null });
}
export async function signInAdmin() {
  await setPersistence(auth, browserLocalPersistence);
  const credential = await signInWithPopup(auth, new GoogleAuthProvider());
  if (credential.user.email !== ADMIN_EMAIL || !credential.user.emailVerified) {
    await signOut(auth);
    throw new Error("هذا الحساب غير مخوّل لإدارة الأكواد.");
  }
  return credential.user;
}
export async function logoutAdmin() { return signOut(auth); }

window.SijilLicenseCloud = { activateCode, verifyActivation };
window.dispatchEvent(new Event("sijil-license-cloud-ready"));
