(function () {
  "use strict";

  function latin(value) {
    return String(value == null ? "" : value)
      .replace(/[٠-٩]/g, function (digit) { return String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)); })
      .replace(/[۰-۹]/g, function (digit) { return String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)); })
      .replace(/٫/g, ".")
      .replace(/٬/g, "");
  }

  window.SijilLatinNumbers = { normalize: latin };
  document.addEventListener("input", function (event) {
    var input = event.target;
    if (!input || input.tagName !== "INPUT") return;
    if (!(input.inputMode === "decimal" || input.inputMode === "numeric" || input.type === "number" || input.id === "m-date")) return;
    var before = input.value, after = latin(before);
    if (before === after) return;
    var cursor = typeof input.selectionStart === "number" ? input.selectionStart : before.length;
    var nextCursor = latin(before.slice(0, cursor)).length;
    input.value = after;
    try { input.setSelectionRange(nextCursor, nextCursor); } catch (_) {}
  }, true);
})();
