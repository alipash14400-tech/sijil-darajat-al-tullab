import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, runTransaction, Timestamp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const api = window.StudyPlannerData;
const PRODUCT_ID = "study-planner";
const DEVICE_KEY = "study-planner-license-device-v1";
const RECEIPT_KEY = "study-planner-license-receipt-v1";
const TRIAL_KEY = "study-planner-free-trial-expiry-v1";
const TRIAL_DURATION = 24 * 60 * 60 * 1000;
let auth = null, db = null, currentUser = null, saveTimer = null, expiryTimer = null, saveBusy = false, licenseActive = false;
const $ = id => document.getElementById(id);

function getTrialExpiry() { try { return Number(localStorage.getItem(TRIAL_KEY)) || 0; } catch { return 0; } }
let TRIAL_EXPIRES_AT = getTrialExpiry();
function trialIsValid() { return TRIAL_EXPIRES_AT > 0 && Date.now() < TRIAL_EXPIRES_AT; }
function updateTrialButton() {
  const button = $("planner-license-trial");
  if (!button) return;
  if (trialIsValid()) { button.textContent = "التجربة المجانية فعّالة"; button.disabled = true; }
  else if (TRIAL_EXPIRES_AT) { button.textContent = "انتهت التجربة المجانية"; button.disabled = true; }
  else { button.textContent = "جرّب التطبيق مجانًا لمدة يوم واحد"; button.disabled = false; }
}

function status(message, user = currentUser) {
  api?.setAccount(user ? { email: user.email || "", displayName: user.displayName || "" } : null, message);
}
function gateMessage(message, error = false) {
  const node = $("planner-license-status");
  if (node) { node.textContent = message || ""; node.classList.toggle("error", !!error); }
}
function lockApp(message) {
  licenseActive = false;
  clearTimeout(expiryTimer);
  clearInterval(expiryTimer);
  document.documentElement.classList.add("study-license-locked");
  updateTrialButton();
  if (message) gateMessage(message);
}
function unlockTrial() {
  if (!trialIsValid()) return false;
  licenseActive = true;
  document.documentElement.classList.remove("study-license-locked");
  const node = $("planner-license-status");
  if (node) {
    const end = new Intl.DateTimeFormat("ar-IQ", { hour: "numeric", minute: "2-digit" }).format(new Date(TRIAL_EXPIRES_AT));
    node.textContent = "الفترة المجانية فعّالة حتى الساعة " + end + ".";
    node.classList.remove("error");
  }
  clearTimeout(expiryTimer);
  clearInterval(expiryTimer);
  expiryTimer = setTimeout(() => lockApp("انتهت الفترة التجريبية المجانية. أدخل كود الاشتراك للمتابعة."), TRIAL_EXPIRES_AT - Date.now());
  updateTrialButton();
  return true;
}
function startTrial() {
  if (TRIAL_EXPIRES_AT) {
    if (unlockTrial()) return;
    gateMessage("استُخدمت التجربة المجانية لهذا الجهاز وانتهت. أدخل كود الاشتراك للمتابعة.", true);
    updateTrialButton();
    return;
  }
  try {
    TRIAL_EXPIRES_AT = Date.now() + TRIAL_DURATION;
    localStorage.setItem(TRIAL_KEY, String(TRIAL_EXPIRES_AT));
    unlockTrial();
    gateMessage("بدأت التجربة المجانية لمدة 24 ساعة على هذا الجهاز.");
  } catch { gateMessage("تعذر حفظ التجربة على هذا الجهاز. اسمح بحفظ بيانات الموقع ثم حاول مجددًا.", true); }
}
function unlockApp(expiresAt) {
  licenseActive = true;
  document.documentElement.classList.remove("study-license-locked");
  const node = $("planner-license-status");
  if (node) {
    const date = expiresAt ? new Intl.DateTimeFormat("ar-IQ", { day: "numeric", month: "long", year: "numeric" }).format(new Date(expiresAt)) : "";
    node.textContent = date ? "الاشتراك فعّال حتى " + date + "." : "الاشتراك فعّال على هذا الجهاز.";
    node.classList.remove("error");
  }
}
function errorText(error) {
  if (error?.code === "auth/unauthorized-domain") return "نطاق الموقع يحتاج تفعيلًا في إعدادات Firebase لتسجيل Google.";
  if (error?.code === "auth/popup-blocked") return "المتصفح منع نافذة Google؛ اسمح بالنوافذ المنبثقة ثم أعد المحاولة.";
  if (error?.code === "auth/popup-closed-by-user") return "أُغلقت نافذة تسجيل الدخول قبل اكتماله.";
  if (error?.code === "auth/network-request-failed") return "تعذر الاتصال. حاول مجددًا عند توفر الإنترنت.";
  return error?.message || "تعذر تسجيل الدخول أو التحقق من الاشتراك. حاول مجددًا.";
}
function licenseRef(hash) { return doc(db, "licenses", hash); }
function accountRef(user = currentUser) { return doc(db, "users", user.uid, "studyPlanner", "current"); }
function savedReceipt() { try { return JSON.parse(localStorage.getItem(RECEIPT_KEY) || "null"); } catch { return null; } }
function deviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) { id = crypto.randomUUID ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint8Array(24))).map(x => x.toString(16).padStart(2, "0")).join(""); localStorage.setItem(DEVICE_KEY, id); }
  return id;
}
async function hashCode(value) {
  const normalized = String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!/^SG[A-F0-9]{32}$/.test(normalized)) throw new Error("تحقق من كتابة كود دفتر الخطة الدراسية.");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalized));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}
async function verifyLicense(saved, user) {
  if (!saved || saved.productId !== PRODUCT_ID || saved.deviceId !== deviceId() || (saved.accountUid && saved.accountUid !== user.uid)) return false;
  if (saved.expiresAt && Date.parse(saved.expiresAt) <= Date.now()) return false;
  if (!navigator.onLine) return !!saved.expiresAt;
  const snap = await getDoc(licenseRef(saved.codeHash));
  if (!snap.exists()) return false;
  const item = snap.data();
  const activatedAt = item.activatedAt?.toMillis?.();
  const expiresAt = item.expiresAt?.toMillis?.();
  return item.status === "active" && item.productId === PRODUCT_ID && item.deviceId === saved.deviceId && item.accountUid === user.uid && Number.isFinite(activatedAt) && Number.isFinite(expiresAt) && expiresAt > Date.now() && expiresAt <= activatedAt + 365 * 86400000;
}
async function activateLicense() {
  const button = $("planner-license-activate"), input = $("planner-license-code"), code = input?.value || "";
  if (!currentUser) { gateMessage("سجّل الدخول بحساب Google أولًا.", true); return; }
  if (button) { button.disabled = true; button.textContent = "جارٍ التحقق…"; }
  try {
    const hash = await hashCode(code), ref = licenseRef(hash), id = deviceId();
    let expiry = null;
    await runTransaction(db, async transaction => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error("الكود غير صحيح أو غير موجود.");
      const item = snap.data();
      if (item.status !== "active") throw new Error("هذا الكود موقوف.");
      if (item.productId !== PRODUCT_ID) throw new Error("هذا الكود مخصص لسجل الدرجات، وليس دفتر الخطة الدراسية.");
      if (item.priceIQD !== 5000 || item.termDays !== 365) throw new Error("بيانات اشتراك الكود غير مطابقة.");
      if (item.accountUid && item.accountUid !== currentUser.uid) throw new Error("هذا الكود مرتبط بحساب Google آخر.");
      if (item.deviceId && item.deviceId !== id) throw new Error("هذا الكود مفعّل على جهاز آخر. يحتاج كل جهاز إلى كود مستقل.");
      const activationStart = item.activatedAt?.toMillis?.() || Date.now();
      const maximumExpiry = activationStart + 365 * 86400000;
      expiry = item.expiresAt?.toMillis?.() <= maximumExpiry ? item.expiresAt : Timestamp.fromDate(new Date(maximumExpiry));
      if (expiry.toMillis() <= Date.now()) throw new Error("انتهت مدة هذا الكود.");
      const teacher = String(currentUser.displayName || api.get()?.profile?.teacher || currentUser.email || "مدرس").trim().slice(0, 80);
      transaction.update(ref, { deviceId: id, activatedAt: item.activatedAt || serverTimestamp(), expiresAt: expiry, accountUid: currentUser.uid, accountEmail: currentUser.email || "", accountTeacherName: teacher });
    });
    const receipt = { version: 1, productId: PRODUCT_ID, codeHash: hash, deviceId: id, accountUid: currentUser.uid, expiresAt: expiry.toDate().toISOString() };
    localStorage.setItem(RECEIPT_KEY, JSON.stringify(receipt));
    if (input) input.value = "";
    unlockApp(receipt.expiresAt);
    await handleUser(currentUser);
  } catch (error) { gateMessage(errorText(error), true); }
  finally { if (button) { button.disabled = false; button.textContent = "تفعيل الاشتراك"; } }
}
function hasLocalData(d) { return !!(d?.profile?.teacher || d?.profile?.school || d?.lessons?.length || d?.annual?.length || d?.monthly?.length || d?.students?.length || d?.schedule?.length || d?.customRecords?.length); }
async function saveNow() {
  if (!currentUser || !licenseActive || saveBusy) return;
  saveBusy = true;
  try {
    const payload = JSON.stringify(api.get());
    if (payload.length > 850000) { status("البيانات كبيرة للمزامنة؛ نزّل نسخة احتياطية."); return; }
    await setDoc(accountRef(), { payload: JSON.parse(payload), appVersion: "1.0.6", updatedAt: serverTimestamp() }, { merge: true });
    status("حُفظت بياناتك سحابيًا على حساب Google.");
  } catch (error) { console.warn("Planner cloud save failed", error?.code || "unknown"); status(errorText(error)); }
  finally { saveBusy = false; }
}
async function loadCloudData(user) {
  const snap = await getDoc(accountRef(user));
  if (snap.exists() && snap.data()?.payload) {
    const cloud = snap.data().payload, local = api.get();
    if (JSON.stringify(cloud) !== JSON.stringify(local)) {
      if (hasLocalData(local)) {
        const restore = confirm("وجدنا نسخة محفوظة في حسابك. موافق: استعادة نسخة الحساب إلى هذا الجهاز. إلغاء: حفظ بيانات هذا الجهاز مكان النسخة السحابية.");
        if (restore) api.replace(cloud); else await saveNow();
      } else api.replace(cloud);
    } else status("تمت مزامنة بياناتك مع حساب Google.");
  } else await saveNow();
}
async function handleUser(user) {
  currentUser = user;
  const account = $("planner-license-account"), login = $("planner-license-login");
  if (account) account.textContent = user ? "الحساب: " + (user.email || user.displayName || "Google") : "سجّل الدخول بالحساب الذي سيُربط بالاشتراك.";
  if (login) login.hidden = !!user;
  if (!user) {
    if (unlockTrial()) { status("الفترة التجريبية المجانية فعّالة. سجّل الدخول لاحقًا لمزامنة بياناتك.", null); return; }
    lockApp(TRIAL_EXPIRES_AT ? "انتهت الفترة التجريبية المجانية. سجّل الدخول وأدخل كود الاشتراك للمتابعة." : "اضغط زر التجربة المجانية أو سجّل الدخول وأدخل كود الاشتراك للمتابعة.");
    status(TRIAL_EXPIRES_AT ? "انتهت الفترة المجانية؛ سجّل الدخول لتفعيل الاشتراك." : "يمكنك بدء التجربة المجانية أو تسجيل الدخول لتفعيل الاشتراك.", null);
    return;
  }
  const receipt = savedReceipt();
  gateMessage("جارٍ التحقق من اشتراك هذا الجهاز…");
  try {
    if (!await verifyLicense(receipt, user)) {
      if (unlockTrial()) {
        status("الفترة التجريبية المجانية فعّالة للحساب " + (user.email || "Google") + ".");
        await loadCloudData(user);
        return;
      }
      lockApp(receipt?.expiresAt && Date.parse(receipt.expiresAt) <= Date.now() ? "انتهى الاشتراك. جدّد الاشتراك بكود جديد لهذا الجهاز." : TRIAL_EXPIRES_AT ? "انتهت الفترة التجريبية. أدخل كود اشتراك دفتر الخطة المرتبط بهذا الحساب." : "ابدأ التجربة المجانية أو أدخل كود اشتراك دفتر الخطة المرتبط بهذا الحساب.");
      status("تسجيل الدخول: " + (user.email || "Google") + " — بانتظار كود الاشتراك.");
      return;
    }
    unlockApp(receipt.expiresAt);
    status("تم التحقق من الاشتراك؛ جارٍ مزامنة بياناتك.");
    await loadCloudData(user);
    if (receipt.expiresAt) {
      const remaining = Date.parse(receipt.expiresAt) - Date.now();
      clearInterval(expiryTimer);
      if (remaining > 0) expiryTimer = setInterval(() => { if (Date.parse(receipt.expiresAt) <= Date.now()) { clearInterval(expiryTimer); lockApp("انتهى الاشتراك. جدّد الاشتراك بكود جديد."); } }, Math.min(3600000, remaining));
    }
  } catch (error) {
    if (!navigator.onLine && receipt?.expiresAt && Date.parse(receipt.expiresAt) > Date.now()) { unlockApp(receipt.expiresAt); status("أنت دون اتصال؛ الاشتراك المحفوظ صالح على هذا الجهاز."); return; }
    if (trialIsValid()) { unlockTrial(); status("الفترة المجانية فعّالة دون اتصال حتى انتهاء يوم التجربة."); return; }
    lockApp(errorText(error));
    status(errorText(error));
  }
}
window.StudyPlannerCloud = {
  async signIn() {
    if (!auth) { gateMessage("خدمة تسجيل Google غير جاهزة؛ تحقق من الاتصال.", true); return; }
    const provider = new GoogleAuthProvider(); provider.setCustomParameters({ prompt: "select_account" });
    try {
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) await signInWithRedirect(auth, provider);
      else await signInWithPopup(auth, provider);
    } catch (error) { gateMessage(errorText(error), true); }
  },
  async signOut() { try { if (auth) await signOut(auth); } catch (error) { status(errorText(error)); } },
  saveNow,
  activateLicense
};
$("planner-license-login")?.addEventListener("click", () => window.StudyPlannerCloud.signIn());
window.addEventListener("study-planner-trial-started", event => {
  TRIAL_EXPIRES_AT = Number(event.detail?.expiresAt) || getTrialExpiry();
  unlockTrial();
});
$("planner-copy-account")?.addEventListener("click", async () => {
  const accountNumber = "910146498316";
  try { await navigator.clipboard.writeText(accountNumber); gateMessage("تم نسخ رقم حساب SuperQi."); }
  catch { window.prompt("انسخ رقم حساب SuperQi:", accountNumber); }
});
$("planner-license-activate")?.addEventListener("click", activateLicense);
$("planner-license-code")?.addEventListener("keydown", event => { if (event.key === "Enter") activateLicense(); });
$("planner-license-renew")?.addEventListener("click", () => { document.documentElement.classList.add("study-license-locked"); $("planner-license-code")?.focus(); });
updateTrialButton();
window.addEventListener("study-plan-data-changed", () => { if (!currentUser || !licenseActive) return; clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 1000); });

try {
  const app = initializeApp(firebaseConfig, "study-planner-cloud");
  auth = getAuth(app); db = getFirestore(app);
  await setPersistence(auth, browserLocalPersistence);
  await getRedirectResult(auth);
  onAuthStateChanged(auth, handleUser);
} catch (error) {
  console.warn("Planner account initialization failed", error?.code || "unknown");
  if (trialIsValid()) { unlockTrial(); status("الفترة المجانية فعّالة على هذا الجهاز.", null); }
  else { lockApp(errorText(error)); status(errorText(error), null); }
}
