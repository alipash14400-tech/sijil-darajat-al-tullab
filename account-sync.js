import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import { initializeFirestore, getFirestore, persistentLocalCache, persistentMultipleTabManager, collection, doc, getDocsFromServer, setDoc, writeBatch, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const $ = id => document.getElementById(id);
const modal = $("account-modal");
const modalStatus = $("account-modal-status");
const topStatus = $("account-status");
const accountButton = $("account-open");
const accountIdentity = $("account-identity");
const signOutButton = $("account-signout");
const ownerKey = "student-grades-cloud-owner-v1";
const cachePrefix = "student-grades-cloud-cache-v1-";
const timers = new Map();
const pendingSections = new Set();
let auth = null;
let db = null;
let currentUser = null;
let closeOnAccountSignIn = false;
let unsubscribeSections = null;
let authGeneration = 0;
const fullBookTimers = new Map();

function setMessage(element, message, error) {
  if (!element) return;
  element.textContent = message || "";
  element.classList.toggle("error", !!error);
}
function updateAccountView(user) {
  const signedIn = !!user;
  accountButton.hidden = signedIn;
  accountIdentity.hidden = !signedIn;
  accountIdentity.textContent = signedIn ? (user.email || user.displayName || "Google") : "";
  signOutButton.hidden = !signedIn;
  const googleButton = $("account-google");
  if (googleButton && googleButton.parentElement) googleButton.parentElement.hidden = signedIn;
  const emailLabel = document.querySelector('label[for="account-email"]');
  const passwordLabel = document.querySelector('label[for="account-password"]');
  if (emailLabel) emailLabel.hidden = signedIn;
  if (passwordLabel) passwordLabel.hidden = signedIn;
  ["account-email-alternative", "account-email", "account-password", "account-create", "account-login", "account-reset"].forEach(id => {
    const element = $(id);
    if (element) element.hidden = signedIn;
  });
  if (signedIn) setMessage(modalStatus, user.email || user.displayName || "Google");
}
function showModal() { modal.hidden = false; setTimeout(() => $("account-email").focus(), 0); }
function closeModal() { modal.hidden = true; }
function openAccountForLicense() { closeOnAccountSignIn = true; showModal(); }
function configured() {
  return !!(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId &&
    firebaseConfig.apiKey !== "YOUR_FIREBASE_WEB_API_KEY" && firebaseConfig.projectId !== "YOUR_PROJECT_ID" &&
    firebaseConfig.appId !== "YOUR_FIREBASE_APP_ID");
}
function normalizeAuthError(error) {
  const code = error && error.code || "";
  if (code === "auth/email-already-in-use") return "البريد الإلكتروني مستخدم بالفعل. سجّل الدخول بدلًا من إنشاء حساب جديد.";
  if (code === "auth/invalid-email") return "البريد الإلكتروني غير صحيح.";
  if (code === "auth/weak-password" || code === "auth/password-does-not-meet-requirements") return "كلمة المرور قصيرة؛ استخدم 6 أحرف على الأقل.";
  if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password") return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  if (code === "auth/network-request-failed") return "تعذر الاتصال بالحساب السحابي. بقيت بياناتك محفوظة على هذا الجهاز.";
  return "تعذر إكمال العملية. تحقق من إعداد الحساب والإنترنت ثم حاول مرة أخرى.";
}
function copy(value) { return JSON.parse(JSON.stringify(value)); }
function blankBook() {
  return {
    version: 6, activeStage: 0, activeBranch: 0, activeGrade: 0, activeSection: 0,
    grades: Array.from({ length: 27 }, () => ({ sections: Array.from({ length: 10 }, () => ({
      name: "", meta: {}, students: Array.from({ length: 10 }, () => ({ name: "", d: {}, d2: {}, m: {} }))
    })) }))
  };
}
function sectionId(grade, section) { return `${grade}_${section}`; }
function nonEmpty(section) {
  if (!section) return false;
  if (String(section.name || "").trim()) return true;
  if (section.meta && Object.values(section.meta).some(value => String(value == null ? "" : value).trim())) return true;
  return Array.isArray(section.students) && section.students.some(student => {
    if (!student) return false;
    if (String(student.name || "").trim()) return true;
    return [student.d, student.d2, student.m].some(group => group && Object.values(group).some(value => String(value == null ? "" : value).trim()));
  });
}
function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map(key => JSON.stringify(key) + ":" + stable(value[key])).join(",")}}`;
  return JSON.stringify(value);
}
function sectionAt(book, grade, section) {
  return book && book.grades && book.grades[grade] && book.grades[grade].sections && book.grades[grade].sections[section];
}
function setSection(book, grade, section, data) {
  if (!book.grades[grade]) book.grades[grade] = { sections: [] };
  if (!book.grades[grade].sections) book.grades[grade].sections = [];
  book.grades[grade].sections[section] = data;
}
function sectionsCollection(user) { return collection(db, "users", user.uid, "sections"); }
function saveConflict(user, id, data) {
  const conflictId = `${id}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
  return setDoc(doc(db, "users", user.uid, "conflicts", conflictId), {
    sourceSectionId: id, payload: copy(data), createdAt: serverTimestamp()
  });
}
function saveLocalCache(user, book) {
  try { localStorage.setItem(cachePrefix + user.uid, JSON.stringify(book)); } catch (_) {}
}

async function applyInitialSnapshot(user, snapshot, generation) {
  if (generation !== authGeneration || !currentUser || currentUser.uid !== user.uid) return;
  const owner = localStorage.getItem(ownerKey);
  const currentBook = window.SijilApp.getBook();
  let workingBook = copy(currentBook);
  let conflicts = 0;
  const cloudIds = new Set();
  const missingLocal = [];

  for (const item of snapshot.docs) {
    const match = /^(\d+)_(\d+)$/.exec(item.id);
    if (!match) continue;
    const grade = Number(match[1]), section = Number(match[2]);
    if (grade < 0 || grade >= 27 || section < 0 || section >= 10) continue;
    cloudIds.add(item.id);
    const cloudSection = item.data().payload;
    if (!cloudSection || typeof cloudSection !== "object") continue;
    const localSection = sectionAt(currentBook, grade, section);
    if (nonEmpty(localSection) && stable(localSection) !== stable(cloudSection)) {
      conflicts++;
      saveConflict(user, item.id, localSection).catch(() => {});
    }
    setSection(workingBook, grade, section, cloudSection);
  }

  for (let grade = 0; grade < 27; grade++) {
    for (let section = 0; section < 10; section++) {
      const id = sectionId(grade, section);
      const localSection = sectionAt(currentBook, grade, section);
      if (!cloudIds.has(id) && nonEmpty(localSection)) {
        setSection(workingBook, grade, section, localSection);
        missingLocal.push({ id, payload: copy(localSection) });
      }
    }
  }

  if (conflicts) {
    try { localStorage.setItem(`student-grades-pre-cloud-${user.uid}-${Date.now()}`, JSON.stringify(currentBook)); } catch (_) {}
  }
  if (generation !== authGeneration) return;
  window.SijilApp.replaceBook(workingBook);
  localStorage.setItem(ownerKey, user.uid);
  saveLocalCache(user, window.SijilApp.getBook());

  if (missingLocal.length) {
    let batch = writeBatch(db), count = 0;
    for (const item of missingLocal) {
      const [grade, section] = item.id.split("_");
      batch.set(doc(db, "users", user.uid, "sections", item.id), { grade: Number(grade), section: Number(section), payload: item.payload, updatedAt: serverTimestamp() });
      count++;
      if (count === 450) { await batch.commit(); batch = writeBatch(db); count = 0; }
    }
    if (count) await batch.commit();
  }
  if (generation !== authGeneration) return;
  setMessage(topStatus, conflicts ? "وجدنا بيانات محلية أقدم مختلفة؛ حُفظت نسخة منها قبل تحميل بيانات الحساب." : "تمت مزامنة البيانات مع الحساب.");
}

async function syncUser(user, generation) {
  if (!user || !db || generation !== authGeneration) return;
  if (unsubscribeSections) { unsubscribeSections(); unsubscribeSections = null; }
  setMessage(topStatus, "جارٍ الاتصال بالحساب ومزامنة البيانات…");

  const owner = localStorage.getItem(ownerKey);
  if (owner && owner !== user.uid) {
    try { localStorage.setItem(cachePrefix + owner, JSON.stringify(window.SijilApp.getBook())); } catch (_) {}
    let cached = null;
    try { cached = JSON.parse(localStorage.getItem(cachePrefix + user.uid) || "null"); } catch (_) {}
    window.SijilApp.replaceBook(cached || blankBook());
  }
  if (!navigator.onLine) {
    setMessage(topStatus, "تم تسجيل الدخول. بيانات الجهاز محفوظة محليًا وستُزامن عند عودة الإنترنت.");
    return;
  }

  try {
    const snapshot = await getDocsFromServer(sectionsCollection(user));
    await applyInitialSnapshot(user, snapshot, generation);
    if (generation !== authGeneration) return;
    unsubscribeSections = onSnapshot(sectionsCollection(user), { includeMetadataChanges: true }, snapshotUpdate => {
      if (generation !== authGeneration) return;
      const next = window.SijilApp.getBook();
      let changed = false;
      snapshotUpdate.docChanges().forEach(change => {
        if (change.type === "removed" || pendingSections.has(`${user.uid}:${change.doc.id}`) || change.doc.metadata.hasPendingWrites) return;
        const match = /^(\d+)_(\d+)$/.exec(change.doc.id);
        const payload = change.doc.data().payload;
        if (!match || !payload) return;
        const grade = Number(match[1]), section = Number(match[2]);
        if (grade < 0 || grade >= 27 || section < 0 || section >= 10) return;
        const localSection = sectionAt(next, grade, section);
        if (stable(localSection) !== stable(payload)) {
          if (nonEmpty(localSection)) saveConflict(user, change.doc.id, localSection).catch(() => {});
          setSection(next, grade, section, payload);
          changed = true;
        }
      });
      if (changed) {
        window.SijilApp.replaceBook(next);
        saveLocalCache(user, window.SijilApp.getBook());
      }
    }, () => setMessage(topStatus, "تعذر الوصول إلى قاعدة البيانات. تحقق من إعداد Firestore وقواعد الأمان.", true));
  } catch (error) {
    console.error("Account sync error:", error && error.code || "unknown");
    setMessage(topStatus, "تعذر الوصول إلى قاعدة البيانات. تحقق من إعداد Firestore وقواعد الأمان.", true);
  }
}

function queueSave(book, grade, section) {
  if (!currentUser || !db || !book || !sectionAt(book, grade, section)) return;
  const user = currentUser;
  const id = sectionId(grade, section);
  const queueKey = `${user.uid}:${id}`;
  const payload = copy(sectionAt(book, grade, section));
  pendingSections.add(queueKey);
  if (timers.has(queueKey)) clearTimeout(timers.get(queueKey));
  timers.set(queueKey, setTimeout(async () => {
    timers.delete(queueKey);
    try {
      await setDoc(doc(db, "users", user.uid, "sections", id), { grade, section, payload, updatedAt: serverTimestamp() });
      pendingSections.delete(queueKey);
      if (currentUser && currentUser.uid === user.uid) setMessage(topStatus, navigator.onLine ? "تمت مزامنة البيانات مع الحساب." : "تم حفظ التغيير على هذا الجهاز، وسيُزامن عند عودة الإنترنت.");
    } catch (error) {
      pendingSections.delete(queueKey);
      if (currentUser && currentUser.uid === user.uid) setMessage(topStatus, "تم حفظ التغيير على هذا الجهاز، وسيُزامن عند عودة الإنترنت.");
    }
  }, 900));
}

function queueBook(book) {
  if (!currentUser || !db || !book || !Array.isArray(book.grades)) return;
  const user = currentUser;
  const timerKey = user.uid;
  const snapshot = copy(book);
  saveLocalCache(user, snapshot);
  if (fullBookTimers.has(timerKey)) clearTimeout(fullBookTimers.get(timerKey));
  for (let grade = 0; grade < 27; grade++) {
    for (let section = 0; section < 10; section++) pendingSections.add(`${user.uid}:${sectionId(grade, section)}`);
  }
  fullBookTimers.set(timerKey, setTimeout(async () => {
    fullBookTimers.delete(timerKey);
    let batch = writeBatch(db), count = 0;
    try {
      for (let grade = 0; grade < 27; grade++) {
        for (let section = 0; section < 10; section++) {
          const id = sectionId(grade, section);
          batch.set(doc(db, "users", user.uid, "sections", id), {
            grade, section, payload: copy(sectionAt(snapshot, grade, section)), updatedAt: serverTimestamp()
          });
          count++;
          if (count === 450) { await batch.commit(); batch = writeBatch(db); count = 0; }
        }
      }
      if (count) await batch.commit();
      if (currentUser && currentUser.uid === user.uid) setMessage(topStatus, "تمت مزامنة البيانات مع الحساب.");
    } catch (_) {
      if (currentUser && currentUser.uid === user.uid) setMessage(topStatus, "تم حفظ التغيير على هذا الجهاز، وسيُزامن عند عودة الإنترنت.");
    } finally {
      for (let grade = 0; grade < 27; grade++) for (let section = 0; section < 10; section++) pendingSections.delete(`${user.uid}:${sectionId(grade, section)}`);
    }
  }, 900));
}

window.SijilAccount = { queueSave, queueBook, getCurrentUser: () => currentUser, openAccount: showModal, openAccountForLicense };
window.dispatchEvent(new Event("sijil-account-ready"));

accountButton.addEventListener("click", () => {
  showModal();
  if (!configured()) setMessage(modalStatus, "إعداد الحساب السحابي غير مكتمل. يلزم إعداد مشروع Firebase أولًا.", true);
  else if (currentUser) setMessage(modalStatus, currentUser.email || "");
});
$("account-close").addEventListener("click", closeModal);
modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && !modal.hidden) closeModal(); });
$("account-create").addEventListener("click", async () => {
  if (!configured()) return setMessage(modalStatus, "الحساب غير جاهز بعد. اتبع خطوات إعداد Firebase أولًا.", true);
  const email = $("account-email").value.trim(), password = $("account-password").value;
  if (!email) return setMessage(modalStatus, "أدخل بريدًا إلكترونيًا صحيحًا.", true);
  if (!password) return setMessage(modalStatus, "أدخل كلمة المرور.", true);
  try { await createUserWithEmailAndPassword(auth, email, password); setMessage(modalStatus, "تم إنشاء الحساب. جارٍ نقل بيانات هذا الجهاز إلى حسابك."); }
  catch (error) { setMessage(modalStatus, normalizeAuthError(error), true); }
});
$("account-login").addEventListener("click", async () => {
  if (!configured()) return setMessage(modalStatus, "الحساب غير جاهز بعد. اتبع خطوات إعداد Firebase أولًا.", true);
  const email = $("account-email").value.trim(), password = $("account-password").value;
  if (!email) return setMessage(modalStatus, "أدخل بريدًا إلكترونيًا صحيحًا.", true);
  if (!password) return setMessage(modalStatus, "أدخل كلمة المرور.", true);
  try { await signInWithEmailAndPassword(auth, email, password); setMessage(modalStatus, "تم تسجيل الدخول. جارٍ تحميل بيانات الحساب."); }
  catch (error) { setMessage(modalStatus, normalizeAuthError(error), true); }
});
$("account-reset").addEventListener("click", async () => {
  if (!configured()) return setMessage(modalStatus, "الحساب غير جاهز بعد. اتبع خطوات إعداد Firebase أولًا.", true);
  const email = $("account-email").value.trim();
  if (!email) return setMessage(modalStatus, "أدخل بريدًا إلكترونيًا صحيحًا.", true);
  try { await sendPasswordResetEmail(auth, email); setMessage(modalStatus, "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك."); }
  catch (error) { setMessage(modalStatus, normalizeAuthError(error), true); }
});
async function signInWithProvider(provider, providerName) {
  if (!configured() || !auth) return setMessage(modalStatus, "الحساب غير جاهز بعد. اتبع خطوات إعداد Firebase أولًا.", true);
  try {
    setMessage(modalStatus, "جارٍ فتح نافذة تسجيل الدخول…");
    await signInWithPopup(auth, provider);
    setMessage(modalStatus, "تم تسجيل الدخول. جارٍ تحميل بيانات الحساب.");
  } catch (error) {
    console.error(providerName + " sign-in error:", error && error.code || "unknown");
    if (error && error.code === "auth/popup-closed-by-user") setMessage(modalStatus, "أُغلقت نافذة تسجيل الدخول قبل اكتمال العملية.", true);
    else if (error && error.code === "auth/popup-blocked") setMessage(modalStatus, "حظر المتصفح نافذة تسجيل الدخول. اسمح بالنوافذ المنبثقة وحاول مرة أخرى.", true);
    else setMessage(modalStatus, normalizeAuthError(error), true);
  }
}
$("account-google").addEventListener("click", () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  signInWithProvider(provider, "Google");
});
signOutButton.addEventListener("click", async () => {
  if (!auth) return;
  try { await signOut(auth); }
  catch (_) { setMessage(topStatus, "تعذر إكمال العملية. تحقق من إعداد الحساب والإنترنت ثم حاول مرة أخرى.", true); }
});

if (!configured()) {
  setMessage(topStatus, "بياناتك محفوظة على هذا الجهاز فقط. أنشئ حسابًا لمزامنتها بين أجهزتك.");
  $("account-create").disabled = true;
  $("account-login").disabled = true;
  $("account-reset").disabled = true;
  $("account-google").disabled = true;
} else {
  try {
    const app = initializeApp(firebaseConfig);
    try {
      db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
    } catch (_) { db = getFirestore(app); }
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence).catch(() => {});
    onAuthStateChanged(auth, user => {
      const generation = ++authGeneration;
      currentUser = user;
      if (unsubscribeSections) { unsubscribeSections(); unsubscribeSections = null; }
      updateAccountView(user);
      window.dispatchEvent(new CustomEvent("sijil-account-state", { detail: { uid: user && user.uid || null, email: user && user.email || "", emailVerified: !!(user && user.emailVerified) } }));
      if (user && closeOnAccountSignIn) { closeOnAccountSignIn = false; closeModal(); }
      accountButton.textContent = "إنشاء حساب / تسجيل الدخول";
      if (!user) {
        setMessage(topStatus, "تم تسجيل الخروج. بياناتك المحفوظة على هذا الجهاز لم تُحذف.");
        return;
      }
      setMessage(modalStatus, user.email || "");
      syncUser(user, generation);
    });
  } catch (error) {
    console.error("Firebase initialization error:", error && error.message || "unknown");
    setMessage(topStatus, "تعذر الاتصال بالحساب السحابي. بقيت بياناتك محفوظة على هذا الجهاز.", true);
  }
}

window.addEventListener("online", () => {
  if (currentUser) syncUser(currentUser, ++authGeneration);
});
