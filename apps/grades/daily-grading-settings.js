(function () {
  "use strict";

  var KEY = "student-grades-daily-scheme-v2";
  var OLD_KEY = "student-grades-daily-scheme-v1";
  var DEFAULTS = [
    { id: "book", name: "دفتر", count: 5, total: 25 },
    { id: "part", name: "مشاركة يومية", count: 5, total: 25 },
    { id: "beh", name: "سلوك", count: 1, total: 10 },
    { id: "extra", name: "نشاط لا صفي", count: 1, total: 10 },
    { id: "e1", name: "امتحان الأول", count: 1, total: 10 },
    { id: "e2", name: "امتحان الثاني", count: 1, total: 10 },
    { id: "e3", name: "امتحان الثالث", count: 1, total: 10 }
  ];

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function validCategories(value) {
    return Array.isArray(value) && value.length > 0 && value.length <= 14 && value.every(function (item) {
      return item && typeof item.id === "string" && /^[a-z0-9_-]{1,50}$/i.test(item.id) &&
        typeof item.name === "string" && item.name.trim().length > 0 && item.name.trim().length <= 32 &&
        Number.isInteger(Number(item.count)) && Number(item.count) >= 1 && Number(item.count) <= 10 &&
        Number.isFinite(Number(item.total)) && Number(item.total) >= 0 && Number(item.total) <= 100;
    });
  }

  function read() {
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (validCategories(saved)) return saved.map(function (item) { return { id: item.id, name: item.name, count: Number(item.count), total: Number(item.total) }; });
      var old = JSON.parse(localStorage.getItem(OLD_KEY) || "null");
      if (Array.isArray(old) && old.length === 7) return DEFAULTS.map(function (item, index) { return { id: item.id, name: item.name, count: item.count, total: Number(old[index]) || 0 }; });
    } catch (_) {}
    return clone(DEFAULTS);
  }

  function fieldKey(category, index) { return category.count === 1 ? category.id : category.id + (index + 1); }
  function inspect(categories) {
    var oldCategories = read();
    var nextById = Object.create(null), oldById = Object.create(null), removedKeys = [];
    categories.forEach(function (item) { nextById[item.id] = item; });
    oldCategories.forEach(function (item) { oldById[item.id] = item; });
    oldCategories.forEach(function (old) {
      var next = nextById[old.id];
      for (var i = next ? next.count : 0; i < old.count; i++) removedKeys.push(fieldKey(old, i));
    });

    var app = null;
    try { app = JSON.parse(localStorage.getItem("student-grades-v1") || "null"); } catch (_) {}
    if (!app || !Array.isArray(app.grades)) return { removedKeys: removedKeys };
    for (var g = 0; g < app.grades.length; g++) {
      var sections = app.grades[g] && app.grades[g].sections || [];
      for (var s = 0; s < sections.length; s++) {
        var students = sections[s] && sections[s].students || [];
        for (var n = 0; n < students.length; n++) {
          for (var p = 0; p < 2; p++) {
            var grades = students[n] && students[n][p ? "d2" : "d"] || {};
            for (var r = 0; r < removedKeys.length; r++) {
              var removedValue = grades[removedKeys[r]];
              if (removedValue != null && String(removedValue).trim() !== "") return { removedKeys: removedKeys, hasRemovedMarks: true };
            }
            for (var c = 0; c < categories.length; c++) {
              var category = categories[c], oldCategory = oldById[category.id];
              if (!oldCategory) continue;
              var scale = sections[s].meta && Number(sections[s].meta.dailyTenScaleVersion) >= 1 ? 0.1 : 1;
              var maxPerCell = Number(category.total) * scale / Number(category.count);
              for (var k = 0; k < category.count; k++) {
                var oldKey = oldCategory.count === 1 && category.count > 1 && k === 0 ? oldCategory.id : oldCategory.count > 1 && category.count === 1 && k === 0 ? oldCategory.id + "1" : fieldKey(category, k);
                var value = Number(grades[fieldKey(category, k)] != null ? grades[fieldKey(category, k)] : grades[oldKey]);
                if (Number.isFinite(value) && value > maxPerCell) return { removedKeys: removedKeys, error: "درجة " + value + " في «" + category.name + "» أعلى من حد الخانة الجديد " + maxPerCell + ". خفّض الدرجة أولًا." };
              }
            }
          }
        }
      }
    }
    return { removedKeys: removedKeys };
  }

  window.SijilDailyBreakdown = {
    get: read,
    validate: function (categories) {
      if (!validCategories(categories)) return { ok: false, reason: "أدخل اسمًا صحيحًا وعدد خانات من 1 إلى 10 لكل مجموعة." };
      var ids = categories.map(function (item) { return item.id; });
      if (new Set(ids).size !== ids.length) return { ok: false, reason: "يوجد اسم مجموعة مكرر." };
      var sum = categories.reduce(function (total, item) { return total + Number(item.total); }, 0);
      if (Math.abs(sum - 100) > 0.001) return { ok: false, reason: "اجعل مجموع درجات اليومي 100." };
      var result = inspect(categories);
      if (result.error) return { ok: false, reason: result.error, removedKeys: result.removedKeys };
      return { ok: true, removedKeys: result.removedKeys, hasRemovedMarks: result.hasRemovedMarks };
    },
    apply: function (categories, removedKeys) {
      var oldCategories = read(), migrations = [];
      oldCategories.forEach(function (old) {
        var next = categories.find(function (item) { return item.id === old.id; });
        if (next && old.count === 1 && next.count > 1) migrations.push({ from: old.id, to: old.id + "1" });
        if (next && old.count > 1 && next.count === 1) migrations.push({ from: old.id + "1", to: old.id });
      });
      localStorage.setItem(KEY, JSON.stringify(categories));
      window.dispatchEvent(new CustomEvent("sijil-daily-breakdown-change", { detail: { removedKeys: removedKeys || [], migrations: migrations } }));
    },
    fieldKey: fieldKey
  };

  function mount() {
    var menu = document.querySelector("#grades-distribution-content") || document.querySelector(".grades-settings-grading") || document.querySelector(".app-settings:not(.gate-settings) .settings-menu");
    if (!menu || document.getElementById("daily-grading-settings")) return;
    var section = document.createElement("section");
    section.id = "daily-grading-settings";
    section.className = "daily-grading-settings";
    section.innerHTML = '<button class="daily-scheme-toggle" type="button" aria-expanded="false" aria-controls="daily-scheme-panel"><span>توزيع درجات اليومي</span><span class="daily-scheme-chevron" aria-hidden="true">⌄</span></button><div class="daily-scheme-panel" id="daily-scheme-panel" hidden><p>غيّر أسماء مجموعات اليومي وعدد خاناتها ودرجاتها. للابتدائي من الأول إلى الرابع تكون درجات اليومي والشهري ونصف السنة والسعي السنوي والنهائي من 10؛ وباقي الصفوف من 100.</p><div class="daily-scheme-grid"></div><button class="btn daily-scheme-add" type="button" data-daily-scheme-add>＋ إضافة مجموعة درجات</button><div class="daily-scheme-total" aria-live="polite"></div><div class="daily-scheme-actions"><button class="btn primary" type="button" data-daily-scheme-apply>حفظ التوزيع</button><button class="btn" type="button" data-daily-scheme-reset>استعادة الافتراضي</button></div><p class="daily-scheme-status" role="status" aria-live="polite"></p></div>';
    menu.appendChild(section);
    var panel = section.querySelector(".daily-scheme-panel");
    var toggle = section.querySelector(".daily-scheme-toggle");
    var grid = panel.querySelector(".daily-scheme-grid");
    var total = panel.querySelector(".daily-scheme-total");
    var status = panel.querySelector(".daily-scheme-status");
    var applyButton = panel.querySelector("[data-daily-scheme-apply]");
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;
    });
    function targetTotal() {
      var stage = document.getElementById("stage-select"), grade = document.getElementById("grade-select");
      return stage && grade && stage.value === "0" && Number(grade.value) <= 3 ? 10 : 100;
    }
    function forDisplay(items, target) {
      var base = items.reduce(function (sum, item) { return sum + Number(item.total || 0); }, 0) || 1, used = 0;
      return items.map(function (item, index) {
        var value = index === items.length - 1 ? Math.round((target - used) * 100) / 100 : Math.round(Number(item.total || 0) * target / base * 100) / 100;
        used += value;
        return { id: item.id, name: item.name, count: item.count, total: value };
      });
    }
    function forStorage(items, target) { return items.map(function (item) { return { id: item.id, name: item.name, count: item.count, total: Number(item.total) * 100 / target }; }); }
    var categories = forDisplay(read(), targetTotal());

    function readForm() {
      return Array.from(grid.querySelectorAll(".daily-scheme-row")).map(function (row) {
        return { id: row.dataset.id, name: row.querySelector('[data-scheme="name"]').value.trim(), count: Number(row.querySelector('[data-scheme="count"]').value), total: Number(row.querySelector('[data-scheme="total"]').value) || 0 };
      });
    }
    function drawRows() {
      grid.innerHTML = "";
      categories.forEach(function (category) {
        var row = document.createElement("div");
        row.className = "daily-scheme-row";
        row.dataset.id = category.id;
        row.innerHTML = '<label class="daily-scheme-name"><span>اسم المجموعة</span><input data-scheme="name" type="text" maxlength="32"></label><label class="daily-scheme-count"><span>عدد الخانات</span><input data-scheme="count" type="text" inputmode="numeric" autocomplete="off"></label><label class="daily-scheme-marks"><span>الدرجة الكلية</span><input data-scheme="total" type="text" inputmode="decimal" autocomplete="off"></label><button class="daily-scheme-remove" type="button" data-scheme-remove aria-label="حذف مجموعة الدرجات">حذف</button>';
        row.querySelector('[data-scheme="name"]').value = category.name;
        row.querySelector('[data-scheme="count"]').value = category.count;
        row.querySelector('[data-scheme="total"]').value = category.total;
        row.querySelectorAll("input").forEach(function (input) {
          input.lang = "en";
          input.addEventListener("input", function () {
            if (input.dataset.scheme === "count") input.value = input.value.replace(/[^0-9]/g, "");
            if (input.dataset.scheme === "total") { var value = input.value.replace(/[^0-9.]/g, ""), dot = value.indexOf("."); if (dot >= 0) value = value.slice(0, dot + 1) + value.slice(dot + 1).replace(/\./g, ""); input.value = value; }
            update();
          });
        });
        row.querySelector("[data-scheme-remove]").addEventListener("click", function () {
          if (categories.length <= 1) { status.textContent = "أبقِ مجموعة واحدة على الأقل."; status.classList.add("error"); return; }
          categories = readForm().filter(function (item) { return item.id !== category.id; });
          drawRows(); update();
        });
        grid.appendChild(row);
      });
    }
    function update() {
      var list = readForm();
      var sum = Math.round(list.reduce(function (a, item) { return a + (Number(item.total) || 0); }, 0) * 10) / 10;
      var target = targetTotal();
      var validation = window.SijilDailyBreakdown.validate(forStorage(list, target));
      total.textContent = "المجموع: " + sum + " / " + target;
      total.classList.toggle("is-valid", validation.ok);
      total.classList.toggle("is-invalid", !validation.ok);
      applyButton.disabled = !validation.ok;
      if (!status.textContent || status.classList.contains("error")) status.textContent = validation.ok ? "" : validation.reason;
      status.classList.toggle("error", !validation.ok);
    }

    section.querySelector("[data-daily-scheme-add]").addEventListener("click", function () {
      if (categories.length >= 14) { status.textContent = "يمكن إضافة 14 مجموعة كحد أقصى."; status.classList.add("error"); return; }
      var id = "custom-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
      categories = readForm();
      categories.push({ id: id, name: "درجة إضافية", count: 1, total: 0 });
      drawRows(); update();
      grid.lastElementChild.querySelector('[data-scheme="name"]').focus();
    });
    applyButton.addEventListener("click", function () {
      var list = readForm(), target = targetTotal(), stored = forStorage(list, target);
      var validation = window.SijilDailyBreakdown.validate(stored);
      if (!validation.ok) { status.textContent = validation.reason; status.classList.add("error"); return; }
      if (validation.hasRemovedMarks && !window.confirm("سيتم حذف درجات الخانات التي أزلتها من جميع الشعب والفصلين. لا يمكن التراجع عن حذف هذه الدرجات. هل تريد المتابعة؟")) return;
      window.SijilDailyBreakdown.apply(stored, validation.removedKeys);
      categories = list;
      status.textContent = "تم حفظ أسماء الخانات وتوزيع درجاتها.";
      status.classList.remove("error");
    });
    section.querySelector("[data-daily-scheme-reset]").addEventListener("click", function () {
      categories = forDisplay(clone(DEFAULTS), targetTotal());
      drawRows(); update();
    });
    [document.getElementById("stage-select"), document.getElementById("grade-select")].forEach(function (control) {
      if (control) control.addEventListener("change", function () {
        categories = forDisplay(read(), targetTotal());
        status.textContent = "";
        status.classList.remove("error");
        drawRows(); update();
      });
    });
    drawRows(); update();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();
