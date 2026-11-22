(function () {
  "use strict";
  var root = document.documentElement;
  var themeKey = "student-grades-theme-v1";
  var paletteKey = "student-grades-palette-v1";
  var accents = {
    forest: { light: "#0f6b63", dark: "#4fb8ad" },
    ocean: { light: "#25689c", dark: "#74b8e4" },
    lavender: { light: "#7955a4", dark: "#b49add" },
    rose: { light: "#b44d66", dark: "#e18ba0" },
    sand: { light: "#a06e22", dark: "#d8ad68" }
  };
  function validTheme(value) { return value === "light" || value === "dark" ? value : "auto"; }
  function validPalette(value) { return Object.prototype.hasOwnProperty.call(accents, value) ? value : "forest"; }
  var theme = validTheme(root.dataset.theme || "auto");
  var palette = validPalette(root.dataset.palette || "forest");
  function syncControls() {
    document.querySelectorAll("[data-theme-mode]").forEach(function (select) { select.value = theme; });
    document.querySelectorAll("[data-theme-palette]").forEach(function (select) { select.value = palette; });
  }
  function syncThemeColor() {
    var dark = theme === "dark" || (theme === "auto" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = accents[palette][dark ? "dark" : "light"];
  }
  function apply(save) {
    root.dataset.theme = theme;
    root.dataset.palette = palette;
    syncControls();
    syncThemeColor();
    if (save) {
      try { localStorage.setItem(themeKey, theme); localStorage.setItem(paletteKey, palette); } catch (_) {}
    }
  }
  apply(false);
  document.addEventListener("change", function (event) {
    if (event.target.matches("[data-theme-mode]")) theme = validTheme(event.target.value);
    else if (event.target.matches("[data-theme-palette]")) palette = validPalette(event.target.value);
    else return;
    apply(true);
  });
  if (window.matchMedia) {
    var systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    if (systemTheme.addEventListener) systemTheme.addEventListener("change", function () { if (theme === "auto") syncThemeColor(); });
  }
})();
