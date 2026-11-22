const CACHE_NAME = "student-grades-pwa-v117";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./manifest-en.webmanifest",
  "./license-config.js",
  "./i18n.js",
  "./appearance.js",
  "./install-app.js",
  "./android-updater.js",
  "./android-version.json?v=1.2.20",
  "./settings-menu.js",
  "./app-lock.js",
  "./onboarding.js",
  "./dashboard.js",
  "./daily-grading-settings.js",
  "./daily-grading-settings.css",
  "./monthly-grading-settings.js",
  "./monthly-grading-settings.css",
  "./latin-numbers.js",
  "./app-lock.css",
  "./firebase-config.js",
  "./account-sync.js",
  "./license-client.js",
  "./license-firebase.js",
  "./admin-codes.html",
  "./admin-grades-codes.html",
  "./admin-planner-codes.html",
  "./admin-asillati-codes.html",
  "./admin-codes.webmanifest",
  "./admin-code-icon-180.png",
  "./admin-code-icon-192.png",
  "./admin-code-icon-512.png",
  "./license-public-key.pem",
  "./app-icon-32.png",
  "./person-male.png",
  "./person-female.png",
  "./app-icon-maskable-192.png",
  "./app-icon-maskable-512.png",
  "./app-icon-180.png",
  "./app-icon-192.png",
  "./app-icon-512.png",
  "./credits-banner.png",
  "./vendor/html2pdf.bundle.min.js"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
});
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("student-grades-pwa-") && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
      return response;
    }).catch(() => caches.match(request).then(cached => cached || caches.match("./index.html"))));
  } else {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
      return response;
    })));
  }
});



