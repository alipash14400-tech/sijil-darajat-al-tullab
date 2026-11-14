(function () {
  "use strict";
  var gate = document.getElementById("license-gate");
  if (!gate) return;
  if (!window.SIJIL_LICENSE_ENABLED) { gate.hidden = true; return; }

  document.documentElement.classList.add("license-locked");
  gate.hidden = false;
  var DEVICE_KEY = "sijil-grades-license-device-v1";
  var RECEIPT_KEY = "sijil-grades-license-receipt-v1";
  var status = document.getElementById("license-status");
  var codeInput = document.getElementById("license-code");
  var activateButton = document.getElementById("license-activate");
  var copyPaymentButton = document.getElementById("copy-payment-account");
  var accountNote = document.getElementById("license-account-note");
  var accountCurrent = document.getElementById("license-account-current");
  var accountEmail = document.getElementById("license-account-email");
  var accountLoginButton = document.getElementById("license-account-login");
  var currentUser = null;
  var authWatcherInstalled = false;
  var initialized = false;

  function setStatus(message, isError) {
    status.textContent = message || "";
    status.classList.toggle("error", !!isError);
  }
  function unlock() {
    gate.hidden = true;
    document.documentElement.classList.remove("license-locked");
  }
  function lock(message) {
    gate.hidden = false;
    document.documentElement.classList.add("license-locked");
    if (message) setStatus(message, true);
  }
  function updateAccount(user) {
    currentUser = user || null;
    if (accountNote) accountNote.textContent = currentUser ? "سيُربط كود التفعيل بالحساب التالي:" : "سجّل الدخول أو أنشئ حسابًا لربط كود التفعيل به.";
    if (accountEmail) accountEmail.textContent = currentUser ? (currentUser.email || currentUser.displayName || "") : "";
    if (accountCurrent) accountCurrent.hidden = !currentUser;
    if (accountLoginButton) accountLoginButton.hidden = !!currentUser;
  }
  function openAccountModal() {
    if (window.SijilAccount && window.SijilAccount.openAccountForLicense) {
      window.SijilAccount.openAccountForLicense();
      return;
    }
    setStatus("جارٍ تجهيز تسجيل الدخول. انتظر لحظة ثم حاول مرة أخرى.", true);
    window.addEventListener("sijil-account-ready", function () {
      if (window.SijilAccount && window.SijilAccount.openAccountForLicense) window.SijilAccount.openAccountForLicense();
    }, { once: true });
  }
  function readSavedActivation() {
    try { return JSON.parse(localStorage.getItem(RECEIPT_KEY) || "null"); } catch { return null; }
  }
  async function refreshForAuth(cloud, user) {
    updateAccount(user);
    var saved = readSavedActivation();
    if (saved && !navigator.onLine) { unlock(); setStatus("يعمل التطبيق دون اتصال. سيتحقق من الحساب والكود عند عودة الإنترنت.", false); return; }
    if (!user) {
      lock("سجّل الدخول إلى حسابك لربط كود التفعيل به.");
      return;
    }
    try {
      if (saved && saved.accountUid && saved.accountUid !== user.uid) {
        lock("هذا الكود مرتبط بحساب آخر. سجّل الدخول بالحساب المرتبط به.");
        return;
      }
      if (saved && !saved.accountUid) {
        saved = await cloud.linkActivationAccount(saved);
        localStorage.setItem(RECEIPT_KEY, JSON.stringify(saved));
      }
      if (saved && await cloud.verifyActivation(saved)) { unlock(); return; }
      if (saved) localStorage.removeItem(RECEIPT_KEY);
      lock("أدخل كود التفعيل المخصص لهذا الجهاز والحساب.");
    } catch (error) {
      lock(error.message || "تعذر التحقق من الحساب والكود في Firebase.");
      console.error("Firebase license verification failed", error);
    }
  }
  function getDeviceId() {
    var value = localStorage.getItem(DEVICE_KEY);
    if (!value) {
      value = crypto.randomUUID ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint8Array(24))).map(function (x) { return x.toString(16).padStart(2, "0"); }).join("");
      localStorage.setItem(DEVICE_KEY, value);
    }
    return value;
  }
  if (copyPaymentButton) copyPaymentButton.addEventListener("click", async function () {
    try { await navigator.clipboard.writeText(document.getElementById("superqi-account").textContent.trim()); setStatus("تم نسخ رقم حساب SuperQi.", false); }
    catch { setStatus("تعذر النسخ. حدّد رقم الحساب وانسخه يدويًا.", true); }
  });

  var deviceId;
  try { deviceId = getDeviceId(); }
  catch {
    lock("تعذر حفظ معرّف هذا الجهاز. اسمح للموقع بحفظ البيانات ثم أعد المحاولة.");
    activateButton.disabled = true;
    return;
  }
  document.getElementById("license-offline-note").textContent = "يلزم الإنترنت للتفعيل والتحقق من حالة الكود. بعد التفعيل يمكن فتح التطبيق دون إنترنت على هذا الجهاز؛ وسيُطبّق الإيقاف عند عودة الاتصال.";

  var cloudPromise;
  function getCloud() { if (!cloudPromise) cloudPromise = import("./license-firebase.js"); return cloudPromise; }
  (async function initialize() {
    try {
      var cloud = await getCloud();
      if (!authWatcherInstalled) {
        authWatcherInstalled = true;
        cloud.onClientAuthChanged(function (user) {
          updateAccount(user);
          if (initialized) refreshForAuth(cloud, user);
        });
      }
      var user = await cloud.waitForClientAuth();
      await refreshForAuth(cloud, user);
      initialized = true;
    } catch (error) {
      lock("تعذر الاتصال بخدمة التفعيل في Firebase. تحقق من الإنترنت وإعدادات Firestore.");
      console.error("Firebase license initialization failed", error);
    }
  })();

  if (accountLoginButton) accountLoginButton.addEventListener("click", openAccountModal);

  activateButton.addEventListener("click", async function () {
    var code = String(codeInput.value || "").trim();
    if (!code) return setStatus("أدخل كود التفعيل أولًا.", true);
    activateButton.disabled = true;
    activateButton.textContent = "جارٍ التحقق…";
    setStatus("جارٍ ربط الكود بهذا الجهاز…", false);
    try {
      var cloud = await getCloud();
      currentUser = cloud.getClientUser() || currentUser;
      if (!currentUser) {
        setStatus("سجّل الدخول أو أنشئ حسابًا قبل تفعيل الكود.", true);
        openAccountModal();
        return;
      }
      var activation = await cloud.activateCode(code, deviceId);
      localStorage.setItem(RECEIPT_KEY, JSON.stringify(activation));
      setStatus("تم تفعيل التطبيق على هذا الجهاز.", false);
      setTimeout(unlock, 450);
    } catch (error) {
      setStatus(error.message || "تعذر التفعيل. تحقق من الإنترنت والكود.", true);
    } finally {
      activateButton.disabled = false;
      activateButton.textContent = "تفعيل التطبيق";
    }
  });
  codeInput.addEventListener("keydown", function (event) { if (event.key === "Enter") activateButton.click(); });
  window.addEventListener("online", async function () {
    try {
      var cloud = await getCloud();
      currentUser = cloud.getClientUser() || currentUser;
      await refreshForAuth(cloud, currentUser);
    } catch { setStatus("تعذر التحقق من حالة الكود الآن. سيُعاد التحقق عند استقرار الاتصال.", true); }
  });
})();
