(function () {
  "use strict";
  var gate = document.getElementById("license-gate");
  if (!gate) return;
  if (!window.SIJIL_LICENSE_ENABLED) { gate.hidden = true; return; }

  document.documentElement.classList.add("license-locked");
  gate.hidden = false;
  var DEVICE_KEY = "sijil-grades-license-device-v1";
  var RECEIPT_KEY = "sijil-grades-license-receipt-v1";
  var TRIAL_KEY = "sijil-grades-trial-v1";
  var TRIAL_DURATION_MS = 24 * 60 * 60 * 1000;
  var trialStorage = null;
  var trialStoragePersistent = false;
  var memoryTrial = null;
  var status = document.getElementById("license-status");
  var codeInput = document.getElementById("license-code");
  var activateButton = document.getElementById("license-activate");
  var trialButton = document.getElementById("license-trial");
  var copyPaymentButton = document.getElementById("copy-payment-account");
  var accountNote = document.getElementById("license-account-note");
  var accountCurrent = document.getElementById("license-account-current");
  var accountEmail = document.getElementById("license-account-email");
  var accountLoginButton = document.getElementById("license-account-login");
  var currentUser = null;
  var authWatcherInstalled = false;
  var initialized = false;
  var trialExpiryTimer = 0;

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
  function expiredCodeMessage(saved) {
    return Number(saved && saved.termDays) === 1
      ? "انتهت صلاحية الكود التجريبي بعد 24 ساعة من أول تفعيل."
      : "انتهت صلاحية هذا الكود بعد مرور سنة على تفعيله. جدّد الاشتراك بكود جديد.";
  }
  function updateAccount(user) {
    currentUser = user || null;
    if (accountNote) accountNote.textContent = currentUser ? "سيُربط الكود باسم المدرس/ة والحساب التالي:" : "سجّل الدخول أو أنشئ حسابًا لربط كود التفعيل به.";
    if (accountEmail) accountEmail.textContent = currentUser ? ((currentUser.displayName ? currentUser.displayName + " — " : "") + (currentUser.email || "")) : "";
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
  function readTrial() {
    try {
      var trial = trialStorage ? JSON.parse(trialStorage.getItem(TRIAL_KEY) || "null") : memoryTrial;
      return trial && trial.version === 1 && trial.deviceId === deviceId && Number.isFinite(trial.startedAt) && Number.isFinite(trial.expiresAt) && trial.expiresAt - trial.startedAt === TRIAL_DURATION_MS ? trial : null;
    } catch { return null; }
  }
  function refreshTrialButton() {
    if (!trialButton) return;
    var trial = readTrial();
    trialButton.hidden = !!trial;
    if (trial && trial.expiresAt <= Date.now()) {
      trialButton.hidden = false;
      trialButton.disabled = true;
      trialButton.textContent = "انتهت التجربة المجانية";
    }
  }
  function allowActiveTrial() {
    var trial = readTrial();
    if (!trial) return false;
    if (Date.now() >= trial.expiresAt) {
      refreshTrialButton();
      lock("انتهت التجربة المجانية. أدخل كود التفعيل للمتابعة.");
      return true;
    }
    unlock();
    setStatus(trialStoragePersistent
      ? "التجربة المجانية فعالة على هذا الجهاز."
      : "التجربة المجانية فعالة ضمن جلسة المتصفح الحالية.", false);
    refreshTrialButton();
    window.clearTimeout(trialExpiryTimer);
    trialExpiryTimer = window.setTimeout(function () { allowActiveTrial(); }, Math.max(0, trial.expiresAt - Date.now() + 20));
    return true;
  }
  function isLocalActivationValid(saved) {
    return !!(saved && [1, 2].includes(saved.version) &&
      /^[a-f0-9]{64}$/.test(saved.codeHash || "") &&
      saved.deviceId === deviceId &&
      Number.isFinite(saved.expiresAt) && saved.expiresAt > Date.now() &&
      (saved.version === 1 || (typeof saved.accountUid === "string" && saved.accountUid.trim().length >= 8 && saved.accountUid.length <= 128)));
  }
  function isConnectionError(error) {
    if (!navigator.onLine) return true;
    var code = String(error && error.code || "").toLowerCase();
    var message = String(error && error.message || "").toLowerCase();
    return ["unavailable", "deadline-exceeded", "auth/network-request-failed", "firestore/unavailable"].includes(code) ||
      /network|offline|fetch|timed out|timeout|تعذر الاتصال|غير متصل/.test(message);
  }
  async function refreshForAuth(cloud, user) {
    updateAccount(user);
    var saved = readSavedActivation();
    var localActivationValid = isLocalActivationValid(saved);
    if (saved && Number.isFinite(saved.expiresAt) && saved.expiresAt <= Date.now()) {
      lock(expiredCodeMessage(saved));
      return;
    }
    // A trial already started on this device remains usable even if an old
    // activation receipt belongs to another device or account.
    if (!localActivationValid && allowActiveTrial()) return;
    if (saved && saved.deviceId !== deviceId) {
      localStorage.removeItem(RECEIPT_KEY);
      lock("بيانات التفعيل لا تطابق هذا الجهاز. أعد التفعيل بالكود المخصص له.");
      return;
    }
    if (saved && user && saved.accountUid && saved.accountUid !== user.uid) {
      lock("هذا الكود مرتبط بحساب آخر. سجّل الدخول بالحساب المرتبط به.");
      return;
    }
    if (localActivationValid && (!navigator.onLine || !user)) {
      unlock();
      setStatus(navigator.onLine
        ? "التفعيل محفوظ على هذا الجهاز. يمكنك استخدام التطبيق، وسجّل الدخول عند الحاجة للمزامنة."
        : "يعمل التطبيق دون اتصال. ستُزامن البيانات ويُتحقق من الكود عند عودة الإنترنت.", false);
      return;
    }
    if (!user) {
      lock("سجّل الدخول إلى حسابك لربط كود التفعيل به.");
      return;
    }
    if (!String(user.displayName || "").trim() && !(localActivationValid && String(saved.accountTeacherName || "").trim())) {
      lock("أدخل اسم المدرس/ة واحفظه في حسابك قبل تفعيل الكود.");
      openAccountModal();
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
      if (saved && await cloud.verifyActivation(saved)) {
        localStorage.setItem(RECEIPT_KEY, JSON.stringify(saved));
        unlock();
        return;
      }
      if (saved) localStorage.removeItem(RECEIPT_KEY);
      if (allowActiveTrial()) return;
      lock("أدخل كود التفعيل المخصص لهذا الجهاز والحساب.");
    } catch (error) {
      if (localActivationValid && isConnectionError(error)) {
        unlock();
        setStatus("تعذر الاتصال بـFirebase الآن. يعمل التفعيل المحفوظ على هذا الجهاز حتى عودة الإنترنت.", false);
      } else {
        lock(error.message || "تعذر التحقق من الحساب والكود في Firebase.");
      }
      console.error("Firebase license verification failed", error);
    }
  }
  function getDeviceId() {
    function createId() {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
      if (window.crypto && crypto.getRandomValues) return Array.from(crypto.getRandomValues(new Uint8Array(24))).map(function (x) { return x.toString(16).padStart(2, "0"); }).join("");
      return "temporary-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
    }
    try {
      var localId = localStorage.getItem(DEVICE_KEY);
      if (!localId) { localId = createId(); localStorage.setItem(DEVICE_KEY, localId); }
      trialStorage = localStorage;
      trialStoragePersistent = true;
      return localId;
    } catch (_) {
      try {
        var sessionId = sessionStorage.getItem(DEVICE_KEY);
        if (!sessionId) { sessionId = createId(); sessionStorage.setItem(DEVICE_KEY, sessionId); }
        trialStorage = sessionStorage;
        trialStoragePersistent = false;
        return sessionId;
      } catch (_) {
        trialStorage = null;
        trialStoragePersistent = false;
        return createId();
      }
    }
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
    if (trialButton) trialButton.disabled = true;
  }
  var savedAtStartup = readSavedActivation();
  var localActivationAtStartup = isLocalActivationValid(savedAtStartup);
  refreshTrialButton();
  if (localActivationAtStartup) unlock();
  else allowActiveTrial();
  document.getElementById("license-offline-note").textContent = "يلزم الإنترنت للتفعيل والتحقق من حالة الكود. بعد التفعيل يمكن فتح التطبيق دون إنترنت على هذا الجهاز؛ وسيُطبّق الإيقاف عند عودة الاتصال.";

  var cloudPromise;
  function getCloud() { if (!cloudPromise) cloudPromise = import("./license-firebase.js"); return cloudPromise; }
  (async function initialize() {
    if (localActivationAtStartup && !navigator.onLine) {
      unlock();
      setStatus("يعمل التطبيق دون اتصال. ستُزامن البيانات ويُتحقق من الكود عند عودة الإنترنت.", false);
      initialized = true;
      return;
    }
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
      if (localActivationAtStartup && isConnectionError(error)) {
        unlock();
        setStatus("تعذر الاتصال بخدمة التفعيل. يعمل التفعيل المحفوظ على هذا الجهاز حتى عودة الإنترنت.", false);
        initialized = true;
      } else if (!allowActiveTrial()) {
        lock(error.message || "تعذر الاتصال بخدمة التفعيل في Firebase. تحقق من الإنترنت وإعدادات Firestore.");
      }
      console.error("Firebase license initialization failed", error);
    }
  })();

  if (accountLoginButton) accountLoginButton.addEventListener("click", openAccountModal);
  if (trialButton) trialButton.addEventListener("click", function () {
    if (readTrial()) { allowActiveTrial(); return; }
    var startedAt = Date.now();
    try {
      var trial = { version: 1, deviceId: deviceId, startedAt: startedAt, expiresAt: startedAt + TRIAL_DURATION_MS };
      if (trialStorage) trialStorage.setItem(TRIAL_KEY, JSON.stringify(trial));
      else memoryTrial = trial;
      allowActiveTrial();
    } catch {
      setStatus("تعذر حفظ بداية التجربة على هذا الجهاز. اسمح بحفظ بيانات الموقع ثم أعد المحاولة.", true);
    }
  });
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && readTrial()) allowActiveTrial();
  });
  window.addEventListener("sijil-account-state", function (event) {
    var detail = event.detail || {};
    if (detail.uid) {
      currentUser = { uid: detail.uid, email: detail.email || "", displayName: detail.displayName || "" };
      updateAccount(currentUser);
      if (!currentUser.displayName) {
        setStatus("أدخل اسم المدرس/ة واحفظه في الحساب قبل تفعيل الكود.", true);
        if (!gate.hidden) openAccountModal();
      } else if (initialized) getCloud().then(function (cloud) { refreshForAuth(cloud, currentUser); });
    } else {
      currentUser = null;
      updateAccount(null);
      if (initialized) getCloud().then(function (cloud) { refreshForAuth(cloud, null); });
    }
  });

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
      if (!currentUser.displayName || !String(currentUser.displayName).trim()) {
        setStatus("أدخل اسم المدرس/ة واحفظه في الحساب قبل تفعيل الكود.", true);
        openAccountModal();
        return;
      }
      var activation = await cloud.activateCode(code, deviceId);
      localStorage.setItem(RECEIPT_KEY, JSON.stringify(activation));
      setStatus("تم التفعيل. جارٍ تجهيز ملفات الاستخدام دون إنترنت…", false);
      if ("serviceWorker" in navigator) {
        try {
          await Promise.race([
            navigator.serviceWorker.ready,
            new Promise(function (resolve) { setTimeout(resolve, 10000); })
          ]);
        } catch (_) {}
      }
      setStatus("تم تفعيل التطبيق وحفظه على هذا الجهاز.", false);
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
    if (!window.SijilAccount) {
      setTimeout(function () { if (!window.SijilAccount) location.reload(); }, 1500);
    }
    try {
      var cloud = await getCloud();
      currentUser = cloud.getClientUser() || currentUser;
      await refreshForAuth(cloud, currentUser);
    } catch { setStatus("تعذر التحقق من حالة الكود الآن. سيُعاد التحقق عند استقرار الاتصال.", true); }
  });
})();
