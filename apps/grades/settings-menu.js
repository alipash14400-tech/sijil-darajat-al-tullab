(function () {
  "use strict";

  function closeMenus(except) {
    document.querySelectorAll("details.app-settings[open]").forEach(function (menu) {
      if (menu !== except) menu.removeAttribute("open");
    });
  }

  document.addEventListener("pointerdown", function (event) {
    var owner = event.target.closest && event.target.closest("details.app-settings");
    closeMenus(owner && owner.open ? owner : null);
  });

  document.addEventListener("focusin", function (event) {
    var owner = event.target.closest && event.target.closest("details.app-settings");
    closeMenus(owner && owner.open ? owner : null);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    var openMenu = document.querySelector("details.app-settings[open]");
    if (!openMenu) return;
    openMenu.removeAttribute("open");
    var summary = openMenu.querySelector("summary");
    if (summary) summary.focus();
  });
})();
