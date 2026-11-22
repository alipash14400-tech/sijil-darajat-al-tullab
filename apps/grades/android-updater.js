(function () {
  "use strict";

  var REPOSITORY = "alipash14400-tech/sijil-darajat-al-tullab";
  var RELEASE_API = "https://api.github.com/repos/" + REPOSITORY + "/releases/latest";
  var VERSION_MANIFEST_URL = "./android-version.json?v=1.2.20";
  var ANDROID_APK_URL = "https://tatbiqati-grades.web.app/apps/grades/student-grades-android.apk.bin";
  var button = document.getElementById("android-update-button");
  var status = document.getElementById("android-update-status");
  if (!button || !status) return;

  var capacitor = window.Capacitor;
  var nativeAndroid = !!(capacitor && capacitor.isNativePlatform && capacitor.isNativePlatform() && capacitor.getPlatform && capacitor.getPlatform() === "android");
  var updater = nativeAndroid && capacitor.Plugins && capacitor.Plugins.AppUpdater;
  var downloadButton = document.getElementById("android-apk-download");
  var lastPromptedVersion = "";
  function english() { return document.documentElement.lang === "en"; }
  function text(ar, en) { return english() ? en : ar; }
  function message(value) { status.textContent = value; }

  if (downloadButton) downloadButton.addEventListener("click", async function (event) {
    event.preventDefault();
    downloadButton.setAttribute("aria-busy", "true");
    message(text("جارٍ تنزيل ملف APK…", "Downloading the APK…"));
    try {
      if (nativeAndroid && updater) {
        await updater.downloadAndInstall({ url: new URL(ANDROID_APK_URL, location.href).href, fileName: "student-grades-android.apk" });
        message(text("بدأ تنزيل APK. وافق على التثبيت عند ظهوره.", "APK download started. Confirm installation when prompted."));
      } else {
        window.location.href = ANDROID_APK_URL;
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
      var pageVersionText = document.querySelector(".app-version");
      var pageVersionMatch = pageVersionText && pageVersionText.textContent.match(/(\d+\.\d+\.\d+)/);
      var availableVersion = null;
      var availableBuildCode = 0;
      var apkUrl = ANDROID_APK_URL;
      var manifestResponse = await fetch(VERSION_MANIFEST_URL, { cache: "no-store" });
      if (manifestResponse.ok) {
        var manifest = await manifestResponse.json();
        if (manifest && parts(manifest.versionName) && manifest.apkUrl) {
          availableVersion = String(manifest.versionName);
          availableBuildCode = Number(manifest.buildCode) || 0;
          apkUrl = String(manifest.apkUrl);
        }
      }
      try {
        var response = await fetch(RELEASE_API, { headers: { Accept: "application/vnd.github+json" }, cache: "no-store" });
        if (response.ok) {
          var release = await response.json();
          var releaseVersion = String(release.tag_name || "").replace(/^v/i, "");
          var releaseApk = (release.assets || []).find(function (asset) { return /\.apk$/i.test(asset.name || ""); });
          if (releaseApk && releaseApk.browser_download_url && (!availableVersion || newer(releaseVersion, availableVersion))) {
            availableVersion = releaseVersion;
            apkUrl = releaseApk.browser_download_url;
          }
        }
      } catch (_) {
        // The site manifest remains the update source when GitHub is unavailable.
      }
      if (!availableVersion && pageVersionMatch) availableVersion = pageVersionMatch[1];
      if (!availableVersion) throw new Error("app version is unavailable");
      var hasVersionUpdate = newer(availableVersion, currentResult.versionName);
      var hasBuildUpdate = availableBuildCode > Number(currentResult.versionCode || 0);
      if (!hasVersionUpdate && !hasBuildUpdate) {
        if (manual) message(text("تطبيقك محدّث إلى الإصدار ", "Your app is up to date (version ") + currentResult.versionName + (english() ? ")." : "."));
        return;
      }
      if (!manual && lastPromptedVersion === availableVersion) return;
      var confirmed = window.confirm(text("يتوفر تحديث Android ", "Android update ") + availableVersion + text(". هل تريد تنزيله وتثبيته الآن؟", ". Download and install it now?"));
      if (!confirmed) {
        lastPromptedVersion = availableVersion;
        message(text("التحديث ", "Update ") + availableVersion + text(" جاهز للتثبيت لاحقًا من الإعدادات.", " is ready to install later from Settings."));
        return;
      }
      await updater.downloadAndInstall({ url: new URL(apkUrl, location.href).href, fileName: "student-grades-" + availableVersion + ".apk" });
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
  window.addEventListener("focus", function () { checkAndUpdate(false); });
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") checkAndUpdate(false); });
  window.setInterval(function () { if (document.visibilityState === "visible") checkAndUpdate(false); }, 5 * 60 * 1000);
})();
