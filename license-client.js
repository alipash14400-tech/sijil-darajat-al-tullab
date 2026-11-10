(function () {
  "use strict";
  var gate = document.getElementById("license-gate");
  if (!gate) return;
  if (!window.SIJIL_LICENSE_ENABLED) {
    gate.hidden = true;
    return;
  }

  document.documentElement.classList.add("license-locked");
  gate.hidden = false;
  var API = String(window.SIJIL_LICENSE_API_BASE || "").replace(/\/$/, "");
  var DEVICE_KEY = "sijil-grades-license-device-v1";
  var RECEIPT_KEY = "sijil-grades-license-receipt-v1";
  var status = document.getElementById("license-status");
  var codeInput = document.getElementById("license-code");
  var activateButton = document.getElementById("license-activate");
  var receipt = null;
  var deviceId = "";

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
  function bytesFromBase64Url(value) {
    var base64 = String(value).replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    var binary = atob(base64), bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  function pemBytes(pem) {
    var base64 = String(pem).replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s/g, "");
    var binary = atob(base64), bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  function timeoutFetch(url, options, timeoutMs) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, timeoutMs || 5000);
    return fetch(url, Object.assign({}, options || {}, { signal: controller.signal, cache: "no-store" }))
      .finally(function () { clearTimeout(timer); });
  }
  function getDeviceId() {
    var value = localStorage.getItem(DEVICE_KEY);
    if (!value) {
      value = crypto.randomUUID ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint8Array(24))).map(function (x) { return x.toString(16).padStart(2, "0"); }).join("");
      localStorage.setItem(DEVICE_KEY, value);
    }
    return value;
  }
  async function verifyReceipt(saved) {
    if (!saved || !saved.receipt || !saved.signature || !window.crypto || !crypto.subtle) return null;
    try {
      var receiptBytes = bytesFromBase64Url(saved.receipt);
      var signatureBytes = bytesFromBase64Url(saved.signature);
      var payload = JSON.parse(new TextDecoder().decode(receiptBytes));
      if (payload.version !== 1 || payload.deviceId !== deviceId || !payload.licenseId) return null;
      var response = await fetch("./license-public-key.pem", { cache: "no-store" });
      if (!response.ok) return null;
      var key = await crypto.subtle.importKey("spki", pemBytes(await response.text()), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
      var valid = await crypto.subtle.verify({ name: "RSASSA-PKCS1-v1_5" }, key, signatureBytes, receiptBytes);
      return valid ? payload : null;
    } catch { return null; }
  }
  async function responseJson(response) {
    var data;
    try { data = await response.json(); } catch { data = {}; }
    if (!response.ok) throw new Error(data.error || "تعذر التحقق من التفعيل.");
    return data;
  }
  async function refreshOnline(saved) {
    if (!API) return null;
    var response = await timeoutFetch(API + "/api/license/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(saved)
    }, 4500);
    return responseJson(response);
  }
  async function activate(code) {
    if (!API) throw new Error("خدمة التفعيل غير مهيأة بعد.");
    var response = await timeoutFetch(API + "/api/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code, deviceId: deviceId })
    }, 10000);
    return responseJson(response);
  }
  function offlineNotice() {
    document.getElementById("license-offline-note").textContent = "يلزم الإنترنت للتفعيل الأول. بعد نجاح التفعيل، يمكن فتح التطبيق دون إنترنت ما دامت بيانات هذا الموقع محفوظة على الجهاز.";
  }

  try {
    deviceId = getDeviceId();
  } catch {
    lock("تعذر حفظ معرّف هذا الجهاز. اسمح للموقع بحفظ البيانات ثم أعد المحاولة.");
    activateButton.disabled = true;
    return;
  }
  offlineNotice();

  var savedText = localStorage.getItem(RECEIPT_KEY);
  if (savedText) {
    try { receipt = JSON.parse(savedText); } catch { receipt = null; }
  }

  (async function initialize() {
    if (receipt) {
      var payload = await verifyReceipt(receipt);
      if (payload) {
        unlock();
        if (API && navigator.onLine) {
          refreshOnline(receipt).then(async function (updated) {
            if (await verifyReceipt(updated)) localStorage.setItem(RECEIPT_KEY, JSON.stringify(updated));
          }).catch(function (error) {
            if (error && /لم يعد صالحًا|غير صالح/.test(error.message)) {
              localStorage.removeItem(RECEIPT_KEY);
              lock(error.message);
            }
          });
        }
        return;
      }
      localStorage.removeItem(RECEIPT_KEY);
      receipt = null;
    }
    lock(API ? "أدخل كود التفعيل المخصص لهذا الجهاز." : "نظام الأكواد جاهز، لكنه يحتاج ربط خدمة التفعيل قبل تشغيله.");
  })();

  activateButton.addEventListener("click", async function () {
    var code = String(codeInput.value || "").trim();
    if (!code) return setStatus("أدخل كود التفعيل أولًا.", true);
    activateButton.disabled = true;
    activateButton.textContent = "جارٍ التحقق…";
    setStatus("جارٍ ربط الكود بهذا الجهاز…", false);
    try {
      var result = await activate(code);
      if (!(await verifyReceipt(result))) throw new Error("وصل رد تفعيل غير موثوق. لم يُحفظ الكود.");
      localStorage.setItem(RECEIPT_KEY, JSON.stringify(result));
      receipt = result;
      setStatus("تم تفعيل التطبيق على هذا الجهاز.", false);
      setTimeout(unlock, 450);
    } catch (error) {
      setStatus(error.message || "تعذر التفعيل. تحقق من الإنترنت والكود.", true);
    } finally {
      activateButton.disabled = false;
      activateButton.textContent = "تفعيل التطبيق";
    }
  });
  codeInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") activateButton.click();
  });
})();
