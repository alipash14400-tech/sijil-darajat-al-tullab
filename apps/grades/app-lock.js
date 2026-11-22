(function () {
  "use strict";

  var STORAGE_KEY = "student-grades-app-lock-v1";
  var ATTEMPTS_KEY = "student-grades-app-lock-attempts-v1";
  var config = loadConfig();
  var overlay;
  var status;
  var unlockForm;
  var pinInput;
  var biometricButton;
  var settingsStatus;
  var enabledControl;
  var biometricControl;
  var pinEditor;
  var pinNew;
  var pinConfirm;
  var unlockInProgress = false;

  function loadConfig() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        enabled: saved.enabled === true,
        biometric: saved.biometric === true,
        salt: typeof saved.salt === "string" ? saved.salt : "",
        hash: typeof saved.hash === "string" ? saved.hash : ""
      };
    } catch (_) {
      return { enabled: false, biometric: false, salt: "", hash: "" };
    }
  }

  function saveConfig() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); return true; }
    catch (_) { return false; }
  }

  function nativeBiometric() {
    return window.SijilNativeBiometric && window.SijilNativeBiometric.isAvailable && window.SijilNativeBiometric.verifyIdentity;
  }

  function hasPin() { return Boolean(config.salt && config.hash); }

  function setStatus(element, message, isError) {
    if (!element) return;
    element.textContent = message || "";
    element.classList.toggle("error", Boolean(isError));
  }

  function syncSettings() {
    if (enabledControl) enabledControl.checked = config.enabled;
    if (biometricControl) {
      biometricControl.checked = config.biometric;
      biometricControl.disabled = !nativeBiometric();
    }
    var removeButton = document.getElementById("app-lock-remove-pin");
    if (removeButton) removeButton.hidden = !hasPin();
    var setButton = document.getElementById("app-lock-set-pin");
    if (setButton) setButton.textContent = hasPin() ? "تغيير رمز PIN" : "تعيين رمز PIN";
  }

  function createSettings() {
    var menu = document.querySelector(".grades-settings-account") || document.querySelector(".app-settings:not(.gate-settings) .settings-menu");
    if (!menu || document.getElementById("app-lock-settings")) return;
    var section = document.createElement("section");
    section.id = "app-lock-settings";
    section.className = "app-lock-settings";
    section.setAttribute("aria-labelledby", "app-lock-title");
    section.innerHTML = '<h3 id="app-lock-title">قفل التطبيق</h3>' +
      '<p>اختياري: اقفل التطبيق عند فتحه أو الرجوع إليه.</p>' +
      '<label class="app-lock-option"><input id="app-lock-enabled" type="checkbox"><span>تفعيل قفل التطبيق</span></label>' +
      '<label class="app-lock-option"><input id="app-lock-biometric" type="checkbox"><span>استخدام بصمة الوجه أو الإصبع</span></label>' +
      '<div class="app-lock-actions"><button class="btn" id="app-lock-set-pin" type="button">تعيين رمز PIN</button><button class="btn" id="app-lock-remove-pin" type="button" hidden>إزالة PIN</button></div>' +
      '<div class="app-lock-pin-editor" id="app-lock-pin-editor" hidden><label for="app-lock-pin-new">رمز PIN جديد (6 أرقام)</label><input id="app-lock-pin-new" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="new-password"><label for="app-lock-pin-confirm">تأكيد رمز PIN</label><input id="app-lock-pin-confirm" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="new-password"><div class="app-lock-actions"><button class="btn primary" id="app-lock-save-pin" type="button">حفظ PIN</button><button class="btn" id="app-lock-cancel-pin" type="button">إلغاء</button></div></div>' +
      '<p class="app-lock-status" id="app-lock-settings-status" role="status" aria-live="polite">يُطلب رمز PIN احتياطي قبل تفعيل القفل.</p>';
    var installSection = menu.querySelector(".install-app-section");
    menu.insertBefore(section, installSection || null);
    enabledControl = section.querySelector("#app-lock-enabled");
    biometricControl = section.querySelector("#app-lock-biometric");
    settingsStatus = section.querySelector("#app-lock-settings-status");
    pinEditor = section.querySelector("#app-lock-pin-editor");
    pinNew = section.querySelector("#app-lock-pin-new");
    pinConfirm = section.querySelector("#app-lock-pin-confirm");

    section.querySelector("#app-lock-set-pin").addEventListener("click", function () {
      pinEditor.hidden = false;
      pinNew.value = "";
      pinConfirm.value = "";
      setTimeout(function () { pinNew.focus(); }, 0);
    });
    section.querySelector("#app-lock-cancel-pin").addEventListener("click", function () { pinEditor.hidden = true; });
    section.querySelector("#app-lock-save-pin").addEventListener("click", savePin);
    section.querySelector("#app-lock-remove-pin").addEventListener("click", function () {
      config.salt = "";
      config.hash = "";
      config.enabled = false;
      config.biometric = false;
      saveConfig();
      syncSettings();
      setStatus(settingsStatus, "تمت إزالة رمز PIN وإيقاف القفل.");
    });
    enabledControl.addEventListener("change", function () {
      if (enabledControl.checked && !hasPin()) {
        enabledControl.checked = false;
        pinEditor.hidden = false;
        setStatus(settingsStatus, "عيّن رمز PIN أولًا ليكون وسيلة الدخول الاحتياطية.", true);
        pinNew.focus();
        return;
      }
      config.enabled = enabledControl.checked;
      if (!saveConfig()) {
        config.enabled = !enabledControl.checked;
        syncSettings();
        setStatus(settingsStatus, "تعذر حفظ الإعداد على هذا الجهاز.", true);
        return;
      }
      syncSettings();
      setStatus(settingsStatus, config.enabled ? "تم تفعيل قفل التطبيق." : "تم إيقاف قفل التطبيق.");
      if (config.enabled) showLock(false);
    });
    biometricControl.addEventListener("change", function () { setBiometricPreference(biometricControl.checked); });
    syncSettings();
  }

  function createOverlay() {
    if (document.getElementById("app-lock-overlay")) return;
    overlay = document.createElement("div");
    overlay.id = "app-lock-overlay";
    overlay.className = "app-lock-overlay";
    overlay.hidden = true;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "app-lock-screen-title");
    overlay.dir = "rtl";
    overlay.innerHTML = '<div class="app-lock-card"><div class="app-lock-mark" aria-hidden="true">🔒</div><h2 id="app-lock-screen-title">التطبيق مقفل</h2><p id="app-lock-screen-help">افتح بالبصمة أو أدخل رمز PIN.</p><button class="btn primary" id="app-lock-unlock-biometric" type="button">فتح بالبصمة أو الوجه</button><form id="app-lock-unlock-form"><label for="app-lock-unlock-pin">رمز PIN</label><input id="app-lock-unlock-pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="current-password" required><button class="btn" type="submit">فتح التطبيق</button></form><p class="app-lock-status" id="app-lock-screen-status" role="status" aria-live="polite"></p></div>';
    document.body.appendChild(overlay);
    status = overlay.querySelector("#app-lock-screen-status");
    unlockForm = overlay.querySelector("#app-lock-unlock-form");
    pinInput = overlay.querySelector("#app-lock-unlock-pin");
    biometricButton = overlay.querySelector("#app-lock-unlock-biometric");
    biometricButton.addEventListener("click", function () { authenticateBiometric(false); });
    unlockForm.addEventListener("submit", function (event) { event.preventDefault(); unlockByPin(); });
  }

  async function derivePinHash(pin, salt) {
    var encoder = new TextEncoder();
    var key = await crypto.subtle.importKey("raw", encoder.encode(pin), "PBKDF2", false, ["deriveBits"]);
    var bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: fromBase64(salt), iterations: 210000, hash: "SHA-256" }, key, 256);
    return toBase64(new Uint8Array(bits));
  }

  function toBase64(bytes) {
    var binary = "";
    bytes.forEach(function (byte) { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }

  function fromBase64(value) {
    var binary = atob(value);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  async function savePin() {
    var pin = pinNew.value;
    if (!/^\d{6}$/.test(pin)) return setStatus(settingsStatus, "يجب أن يتكون PIN من 6 أرقام.", true);
    if (pin !== pinConfirm.value) return setStatus(settingsStatus, "رمزا PIN غير متطابقين.", true);
    if (!window.crypto || !window.crypto.subtle || !window.crypto.getRandomValues) return setStatus(settingsStatus, "يتطلب إعداد PIN اتصالًا آمنًا. افتح التطبيق عبر HTTPS أو تطبيق الهاتف.", true);
    try {
      var salt = new Uint8Array(16);
      crypto.getRandomValues(salt);
      config.salt = toBase64(salt);
      config.hash = await derivePinHash(pin, config.salt);
      if (!saveConfig()) throw new Error("storage");
      pinEditor.hidden = true;
      pinNew.value = "";
      pinConfirm.value = "";
      syncSettings();
      setStatus(settingsStatus, "تم حفظ رمز PIN على هذا الجهاز.");
    } catch (_) {
      setStatus(settingsStatus, "تعذر حفظ رمز PIN. تحقق من مساحة التخزين ثم حاول مرة أخرى.", true);
    }
  }

  async function setBiometricPreference(enabled) {
    if (!enabled) {
      config.biometric = false;
      saveConfig();
      syncSettings();
      setStatus(settingsStatus, "تم إيقاف فتح التطبيق بالبصمة.");
      return;
    }
    if (!hasPin()) {
      biometricControl.checked = false;
      setStatus(settingsStatus, "عيّن رمز PIN أولًا ليكون وسيلة الدخول الاحتياطية.", true);
      return;
    }
    if (!nativeBiometric()) {
      biometricControl.checked = false;
      setStatus(settingsStatus, "فتح البصمة متاح في تطبيق الهاتف. يمكنك استخدام PIN هنا.", true);
      return;
    }
    try {
      var available = await window.SijilNativeBiometric.isAvailable();
      if (!available || !available.isAvailable) {
        biometricControl.checked = false;
        setStatus(settingsStatus, "لا توجد بصمة مسجلة أو متاحة على هذا الجهاز. تحقق من إعدادات قفل الهاتف.", true);
        return;
      }
      config.biometric = true;
      if (!saveConfig()) throw new Error("storage");
      syncSettings();
      setStatus(settingsStatus, "تم تفعيل فتح التطبيق بالبصمة. يبقى PIN وسيلة احتياطية.");
    } catch (_) {
      biometricControl.checked = false;
      setStatus(settingsStatus, "تعذر تفعيل البصمة على هذا الجهاز.", true);
    }
  }

  function showLock(tryBiometric) {
    if (!config.enabled || !hasPin()) return;
    createOverlay();
    if (!overlay.hidden) return;
    biometricButton.hidden = !config.biometric || !nativeBiometric();
    document.querySelectorAll("details.app-settings[open]").forEach(function (menu) { menu.removeAttribute("open"); });
    overlay.hidden = false;
    pinInput.value = "";
    setStatus(status, "");
    if (tryBiometric && config.biometric && nativeBiometric()) authenticateBiometric(true);
    else setTimeout(function () { if (!overlay.hidden) pinInput.focus(); }, 50);
  }

  function unlock() {
    overlay.hidden = true;
    pinInput.value = "";
    unlockInProgress = false;
  }

  async function authenticateBiometric(automatic) {
    if (unlockInProgress || !config.enabled || !config.biometric || !nativeBiometric()) return;
    unlockInProgress = true;
    biometricButton.disabled = true;
    try {
      await window.SijilNativeBiometric.verifyIdentity();
      unlock();
    } catch (_) {
      unlockInProgress = false;
      setStatus(status, automatic ? "تعذر التحقق بالبصمة. أدخل رمز PIN للمتابعة." : "لم يكتمل التحقق. أدخل رمز PIN أو أعد المحاولة.", true);
      pinInput.focus();
    } finally {
      biometricButton.disabled = false;
    }
  }

  async function unlockByPin() {
    if (unlockInProgress) return;
    var attempts = 0;
    try { attempts = Number(localStorage.getItem(ATTEMPTS_KEY) || 0); } catch (_) {}
    if (attempts >= 5) {
      setStatus(status, "تم إيقاف المحاولات مؤقتًا. انتظر 30 ثانية ثم حاول مجددًا.", true);
      return;
    }
    var pin = pinInput.value;
    if (!/^\d{6}$/.test(pin)) return setStatus(status, "أدخل PIN المكوّن من 6 أرقام.", true);
    unlockInProgress = true;
    try {
      var candidate = await derivePinHash(pin, config.salt);
      if (candidate !== config.hash) {
        attempts += 1;
        try { localStorage.setItem(ATTEMPTS_KEY, String(attempts)); } catch (_) {}
        setStatus(status, attempts >= 5 ? "تم إيقاف المحاولات مؤقتًا. انتظر 30 ثانية ثم أعد تحميل التطبيق." : "رمز PIN غير صحيح.", true);
        if (attempts >= 5) setTimeout(function () { try { localStorage.removeItem(ATTEMPTS_KEY); } catch (_) {} }, 30000);
        pinInput.select();
        unlockInProgress = false;
        return;
      }
      try { localStorage.removeItem(ATTEMPTS_KEY); } catch (_) {}
      unlock();
    } catch (_) {
      setStatus(status, "تعذر التحقق من PIN. أعد تحميل التطبيق وحاول مرة أخرى.", true);
      unlockInProgress = false;
    }
  }

  function install() {
    createSettings();
    createOverlay();
    syncSettings();
    if (config.enabled && hasPin()) showLock(true);
    var wasHidden = false;
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { wasHidden = true; return; }
      if (wasHidden) { wasHidden = false; showLock(true); }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
