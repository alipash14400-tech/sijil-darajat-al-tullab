(function () {
  "use strict";

  var REPOSITORY = "alipash14400-tech/sijil-darajat-al-tullab";
  var RELEASE_API = "https://api.github.com/repos/" + REPOSITORY + "/releases/latest";
  var button = document.getElementById("android-update-button");
  var status = document.getElementById("android-update-status");
  if (!button || !status) return;

  var capacitor = window.Capacitor;
  var nativeAndroid = !!(capacitor && capacitor.isNativePlatform && capacitor.isNativePlatform() && capacitor.getPlatform && capacitor.getPlatform() === "android");
  var updater = nativeAndroid && capacitor.Plugins && capacitor.Plugins.AppUpdater;
  var downloadButton = document.getElementById("android-apk-download");
  function english() { return document.documentElement.lang === "en"; }
  function text(ar, en) { return english() ? en : ar; }
  function message(value) { status.textContent = value; }

  if (downloadButton) downloadButton.addEventListener("click", async function (event) {
    event.preventDefault();
    downloadButton.setAttribute("aria-busy", "true");
    message(text("جارٍ البحث عن ملف APK…", "Looking for the APK…"));
    try {
      var response = await fetch(RELEASE_API, { headers: { Accept: "application/vnd.github+json" }, cache: "no-store" });
      if (response.status === 404) {
        message(text("لا يوجد ملف APK منشور بعد.", "No APK has been published yet."));
        return;
      }
      if (!response.ok) throw new Error("release lookup failed");
      var release = await response.json();
      var apk = (release.assets || []).find(function (asset) { return /\.apk$/i.test(asset.name || ""); });
      if (!apk || !apk.browser_download_url) {
        message(text("الإصدار الأخير لا يحتوي ملف APK.", "The latest release has no APK file."));
        return;
      }
      if (nativeAndroid && updater) {
        await updater.downloadAndInstall({ url: apk.browser_download_url, fileName: apk.name || "student-grades-android.apk" });
        message(text("بدأ تنزيل APK. وافق على التثبيت عند ظهوره.", "APK download started. Confirm installation when prompted."));
      } else {
        window.location.href = apk.browser_download_url;
        message(text("بدأ تنزيل ملف APK.", "APK download started."));
      }
    } catch (error) {
      message(text("تعذر الوصول إلى ملف APK. تحقق من الإنترنت وحاول مجددًا.", "Could not reach the APK file. Check your internet and try again."));
    } finally {
      downloadButton.removeAttribute("aria-busy");
    }
  });

  if (!nativeAndroid) {
    button.hidden = true;
    return;
  }

  if (!updater) {
    button.disabled = true;
    status.textContent = text("ميزة التحديث غير متوفرة في هذه النسخة. ثبّت أحدث ملف APK.", "App updates are unavailable in this version. Install the latest APK.");
    return;
  }

  function parts(version) {
    var match = String(version || "").match(/(\d+)\.(\d+)\.(\d+)/);
    return match ? match.slice(1).map(Number) : null;
  }
  function newer(candidate, current) {
    var a = parts(candidate), b = parts(current);
    if (!a || !b) return false;
    for (var i = 0; i < 3; i++) {
      if (a[i] !== b[i]) return a[i] > b[i];
    }
    return false;
  }
  async function checkAndUpdate(manual) {
    if (button.disabled) return;
    button.disabled = true;
    button.textContent = "جارٍ التحقق…";
    message("");
    try {
      var currentResult = await updater.getAppVersion();
      var response = await fetch(RELEASE_API, { headers: { Accept: "application/vnd.github+json" }, cache: "no-store" });
      if (response.status === 404) {
        message(text("لا يوجد إصدار Android منشور حتى الآن.", "No Android release has been published yet."));
        return;
      }
      if (!response.ok) throw new Error("release lookup failed");
      var release = await response.json();
      var availableVersion = String(release.tag_name || "").replace(/^v/i, "");
      if (!newer(availableVersion, currentResult.versionName)) {
        if (manual) message(text("تطبيقك محدّث إلى الإصدار ", "Your app is up to date (version ") + currentResult.versionName + (english() ? ")." : "."));
        return;
      }
      var apk = (release.assets || []).find(function (asset) { return /\.apk$/i.test(asset.name || ""); });
      if (!apk || !apk.browser_download_url) {
        message(text("عُثر على إصدار ", "Version ") + availableVersion + text("، لكن ملف APK غير مرفق به.", " was found, but it has no APK attached."));
        return;
      }
      var confirmed = window.confirm(text("يتوفر تحديث Android ", "Android update ") + availableVersion + text(". هل تريد تنزيله وتثبيته الآن؟", ". Download and install it now?"));
      if (!confirmed) {
        message(text("التحديث ", "Update ") + availableVersion + text(" جاهز للتثبيت لاحقًا من الإعدادات.", " is ready to install later from Settings."));
        return;
      }
      await updater.downloadAndInstall({ url: apk.browser_download_url, fileName: "student-grades-" + availableVersion + ".apk" });
      message(text("بدأ تنزيل التحديث ", "Downloading update ") + availableVersion + text(". سيظهر إشعار عند اكتماله، ثم وافق على التثبيت.", ". You will be asked to confirm installation when the download finishes."));
    } catch (error) {
      message(text("تعذر التحقق أو تنزيل التحديث. تأكد من اتصال الإنترنت ثم أعد المحاولة.", "Could not check or download the update. Check your internet connection and try again."));
    } finally {
      button.disabled = false;
      button.textContent = text("تحقق من تحديث Android", "Check Android update");
    }
  }

  button.hidden = false;
  button.textContent = text("تحقق من تحديث Android", "Check Android update");
  button.addEventListener("click", function () { checkAndUpdate(true); });
  var tableUpdateButton = document.getElementById("check-update");
  if (tableUpdateButton) tableUpdateButton.addEventListener("click", function (event) { event.preventDefault(); checkAndUpdate(true); });
  new MutationObserver(function () { button.textContent = text("تحقق من تحديث Android", "Check Android update"); }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  window.addEventListener("load", function () { setTimeout(function () { checkAndUpdate(false); }, 1800); });
})();
