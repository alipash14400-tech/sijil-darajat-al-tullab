(() => {
  const STORAGE_KEY = "study-planner-free-trial-expiry-v1";
  const DURATION = 24 * 60 * 60 * 1000;
  const button = document.getElementById("planner-license-trial");
  const message = document.getElementById("planner-license-status");
  let expiryTimer = 0;
  if (!button) return;

  const expiry = () => {
    try { return Number(localStorage.getItem(STORAGE_KEY)) || 0; }
    catch { return 0; }
  };
  const update = () => {
    window.clearTimeout(expiryTimer);
    const endsAt = expiry();
    if (endsAt > Date.now()) {
      button.textContent = "التجربة المجانية فعّالة";
      button.disabled = true;
      document.documentElement.classList.remove("study-license-locked");
      if (message && !message.textContent) message.textContent = "التجربة المجانية فعّالة على هذا الجهاز.";
      const remaining = endsAt - Date.now();
      expiryTimer = window.setTimeout(update, Math.min(remaining + 50, 2147483647));
      return;
    }
    if (endsAt) {
      document.documentElement.classList.add("study-license-locked");
      button.textContent = "انتهت التجربة المجانية";
      button.disabled = true;
      if (message) message.textContent = "انتهت التجربة المجانية. أدخل كود الاشتراك للمتابعة.";
    }
  };

  button.addEventListener("click", () => {
    let endsAt = expiry();
    if (endsAt) { update(); return; }
    endsAt = Date.now() + DURATION;
    try { localStorage.setItem(STORAGE_KEY, String(endsAt)); }
    catch {
      if (message) message.textContent = "تعذر حفظ التجربة على هذا الجهاز. اسمح بحفظ بيانات الموقع ثم حاول مجددًا.";
      return;
    }
    if (message) message.textContent = "بدأت التجربة المجانية لمدة 24 ساعة على هذا الجهاز.";
    update();
    window.dispatchEvent(new CustomEvent("study-planner-trial-started", { detail: { expiresAt: endsAt } }));
  });

  update();
  window.addEventListener("focus", update);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) update(); });
})();
