(function () {
  "use strict";
  var KEY = "student-grades-monthly-scheme-v1";
  var slots = [
    ["a1", "الشهر الأول - الفصل الأول"], ["a2", "الشهر الثاني - الفصل الأول"],
    ["half", "امتحان نصف السنة"], ["b1", "الشهر الأول - الفصل الثاني"],
    ["b2", "الشهر الثاني - الفصل الثاني"], ["fin", "الامتحان النهائي"]
  ];
  var defaults = slots.map(function (slot) { return { id: slot[0], slot: slot[0], name: slot[1], count: 1, total: 100 }; });
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function valid(items) {
    return Array.isArray(items) && items.length > 0 && items.length <= 24 && items.every(function (item) {
      return item && /^[a-z0-9_-]{1,50}$/i.test(String(item.id || "")) && slots.some(function (slot) { return slot[0] === item.slot; }) &&
        typeof item.name === "string" && item.name.trim().length > 0 && item.name.trim().length <= 32 &&
        Number.isInteger(Number(item.count)) && Number(item.count) >= 1 && Number(item.count) <= 10 &&
        Number.isFinite(Number(item.total)) && Number(item.total) >= 0 && Number(item.total) <= 100;
    });
  }
  function read() {
    try { var saved = JSON.parse(localStorage.getItem(KEY) || "null"); if (valid(saved)) return saved.map(function (x) { return { id: x.id, slot: x.slot, name: x.name, count: Number(x.count), total: Number(x.total) }; }); } catch (_) {}
    return clone(defaults);
  }
  function fieldKey(category, index) { return category.count === 1 ? category.id : category.id + "_" + (index + 1); }
  function appBook() { try { return window.SijilApp && window.SijilApp.getBook ? window.SijilApp.getBook() : null; } catch (_) { return null; } }
  function valuesFor(student, category) {
    var data = student && student.m || {}, result = [];
    for (var i = 0; i < category.count; i++) result.push(data[fieldKey(category, i)]);
    return result;
  }
  function hasMarks(book, categories) {
    if (!book || !Array.isArray(book.grades)) return false;
    return book.grades.some(function (grade) { return (grade.sections || []).some(function (section) { return (section.students || []).some(function (student) {
      return categories.some(function (category) { return valuesFor(student, category).some(function (value) { return value != null && String(value).trim() !== ""; }); });
    }); }); });
  }
  function hasReducedMarks(book, old, items) {
    if (!book || !Array.isArray(book.grades)) return false;
    return book.grades.some(function (grade) { return (grade.sections || []).some(function (section) { return (section.students || []).some(function (student) {
      return old.some(function (category) { var next = items.find(function (item) { return item.id === category.id; }); if (!next || category.count === 1 || next.count >= category.count) return false;
        var firstRemoved = next.count === 1 ? category.count : next.count;
        for (var i = firstRemoved; i < category.count; i++) { var value = (student.m || {})[fieldKey(category, i)]; if (value != null && String(value).trim() !== "") return true; }
        return false;
      });
    }); }); });
  }
  function findOverflow(book, old, items) {
    if (!book || !Array.isArray(book.grades)) return "";
    for (var g = 0; g < book.grades.length; g++) {
      var target = g < 4 ? 10 : 100;
      for (var s = 0; s < (book.grades[g].sections || []).length; s++) {
        var section = book.grades[g].sections[s], rawScale = target === 10 && Number(section.meta && section.meta.dailyTenScaleVersion) < 2 ? 100 : target;
        for (var n = 0; n < (section.students || []).length; n++) {
          var student = section.students[n], data = student.m || {};
          for (var c = 0; c < items.length; c++) {
            var next = items[c], prior = old.find(function (item) { return item.id === next.id; });
            if (!prior) continue;
            var limit = rawScale * Number(next.total) / 100 / Number(next.count);
            for (var k = 0; k < next.count; k++) {
              var value;
              if (prior.count === 1 && next.count > 1) value = k === 0 ? data[prior.id] : null;
              else if (prior.count > 1 && next.count === 1) value = valuesFor(student, prior).reduce(function (sum, part) { return sum + (part != null && String(part).trim() !== "" && Number.isFinite(Number(part)) ? Number(part) : 0); }, 0);
              else value = data[fieldKey(next, k)];
              if (value != null && String(value).trim() !== "" && Number.isFinite(Number(value)) && Number(value) > limit + 0.001) return "درجة محفوظة في «" + next.name + "» أعلى من الحد الجديد " + limit + ". عدّل التوزيع أو الدرجة أولًا حتى لا تُفقد.";
            }
          }
        }
      }
    }
    return "";
  }
  window.SijilMonthlyBreakdown = {
    get: read,
    fieldKey: fieldKey,
    validate: function (items) {
      if (!valid(items)) return { ok: false, reason: "أدخل اسمًا صحيحًا وعدد خانات من 1 إلى 10 لكل مجموعة." };
      var ids = items.map(function (item) { return item.id; });
      if (new Set(ids).size !== ids.length) return { ok: false, reason: "يوجد اسم خانة مكرر؛ اجعل أسماء الخانات مختلفة." };
      for (var i = 0; i < slots.length; i++) {
        var sum = items.filter(function (item) { return item.slot === slots[i][0]; }).reduce(function (total, item) { return total + Number(item.total); }, 0);
        if (Math.abs(sum - 100) > 0.001) return { ok: false, reason: "اجعل مجموع توزيع «" + slots[i][1] + "» يساوي 100%." };
      }
      var book = appBook(), old = read(), removed = old.filter(function (item) { return !items.some(function (next) { return next.id === item.id; }); });
      var overflow = findOverflow(book, old, items); if (overflow) return { ok: false, reason: overflow };
      if (hasMarks(book, removed) || hasReducedMarks(book, old, items)) return { ok: true, hasRemovedMarks: true };
      return { ok: true, hasRemovedMarks: false };
    },
    apply: function (items) {
      var book = appBook(), old = read();
      if (book) (book.grades || []).forEach(function (grade) { (grade.sections || []).forEach(function (section) { (section.students || []).forEach(function (student) {
        student.m = student.m || {};
        old.forEach(function (prior) {
          var next = items.find(function (item) { return item.id === prior.id; });
          if (!next) { for (var r = 0; r < prior.count; r++) delete student.m[fieldKey(prior, r)]; return; }
          var before = valuesFor(student, prior), hasAny = before.some(function (value) { return value != null && String(value).trim() !== ""; });
          if (!hasAny) return;
          if (prior.count === 1 && next.count > 1) {
            if (student.m[next.id + "_1"] == null) student.m[next.id + "_1"] = student.m[prior.id];
            delete student.m[prior.id];
          } else if (prior.count > 1 && next.count === 1) {
            var sum = before.reduce(function (acc, value) { var n = Number(value); return acc + (value != null && String(value).trim() !== "" && Number.isFinite(n) ? n : 0); }, 0);
            student.m[next.id] = Math.round(sum * 100) / 100;
            for (var j = 0; j < prior.count; j++) delete student.m[fieldKey(prior, j)];
          } else {
            for (var k = next.count; k < prior.count; k++) delete student.m[fieldKey(prior, k)];
          }
        });
      }); }); });
      localStorage.setItem(KEY, JSON.stringify(items));
      if (book && window.SijilApp && window.SijilApp.replaceBook) window.SijilApp.replaceBook(book);
      window.dispatchEvent(new CustomEvent("sijil-monthly-breakdown-change"));
    },
    slots: clone(slots)
  };

  function mount() {
    var content = document.getElementById("grades-distribution-content");
    if (!content || document.getElementById("monthly-grading-settings")) return;
    var section = document.createElement("section");
    section.id = "monthly-grading-settings";
    section.className = "daily-grading-settings monthly-grading-settings";
    section.innerHTML = '<button class="daily-scheme-toggle monthly-scheme-toggle" type="button" aria-expanded="false" aria-controls="monthly-scheme-panel"><span>توزيع درجات الشهرية</span><span class="daily-scheme-chevron" aria-hidden="true">⌄</span></button><div class="daily-scheme-panel" id="monthly-scheme-panel" hidden><p class="monthly-scheme-description">قسّم درجات كل امتحان إلى خانات، وغيّر أسماءها وعددها. يجب أن يكون مجموع توزيع كل امتحان 100%.</p><div class="monthly-scheme-groups"></div><div class="daily-scheme-grid monthly-scheme-grid"></div><button class="btn daily-scheme-add" type="button" data-monthly-add>＋ إضافة خانة شهرية</button><div class="daily-scheme-total monthly-scheme-total" aria-live="polite"></div><div class="daily-scheme-actions"><button class="btn primary" type="button" data-monthly-apply>حفظ التوزيع الشهري</button><button class="btn" type="button" data-monthly-reset>استعادة الافتراضي</button></div><p class="daily-scheme-status monthly-scheme-status" role="status" aria-live="polite"></p></div>';
    content.appendChild(section);
    var panel = section.querySelector(".daily-scheme-panel"), toggle = section.querySelector(".monthly-scheme-toggle"), grid = section.querySelector(".monthly-scheme-grid"), groups = section.querySelector(".monthly-scheme-groups"), status = section.querySelector(".monthly-scheme-status"), total = section.querySelector(".monthly-scheme-total"), categories = read();
    toggle.addEventListener("click", function () { var open = toggle.getAttribute("aria-expanded") !== "true"; toggle.setAttribute("aria-expanded", String(open)); panel.hidden = !open; });
    function draw() {
      groups.innerHTML = "";
      slots.forEach(function (slot) { var group = categories.filter(function (item) { return item.slot === slot[0]; }); var sum = group.reduce(function (n, item) { return n + Number(item.total); }, 0); var card = document.createElement("div"); card.className = "monthly-scheme-group"; card.textContent = slot[1] + " · " + (Math.round(sum * 10) / 10) + "%"; card.classList.toggle("is-valid", Math.abs(sum - 100) < .001); groups.appendChild(card); });
      grid.innerHTML = "";
      categories.forEach(function (category) {
        var row = document.createElement("div"); row.className = "daily-scheme-row monthly-scheme-row"; row.dataset.id = category.id;
        row.innerHTML = '<label class="daily-scheme-name"><span>اسم الخانة</span><input data-month="name" type="text" maxlength="32"></label><label class="monthly-scheme-slot"><span>تابعة لـ</span><select data-month="slot"></select></label><label class="daily-scheme-count"><span>عدد الخانات</span><input data-month="count" type="text" inputmode="numeric" lang="en" autocomplete="off"></label><label class="daily-scheme-marks"><span>التوزيع (%)</span><input data-month="total" type="text" inputmode="decimal" lang="en" autocomplete="off"></label><button class="daily-scheme-remove" type="button" data-month-remove aria-label="حذف الخانة">حذف</button>';
        row.querySelector('[data-month="name"]').value = category.name;
        row.querySelector('[data-month="count"]').value = category.count;
        row.querySelector('[data-month="total"]').value = category.total;
        var select = row.querySelector('[data-month="slot"]');
        slots.forEach(function (slot) { var option = document.createElement("option"); option.value = slot[0]; option.textContent = slot[1]; option.selected = category.slot === slot[0]; select.appendChild(option); });
        row.querySelectorAll("input").forEach(function (input) { input.addEventListener("input", function (event) { if (input.dataset.month === "count") event.target.value = event.target.value.replace(/[^0-9]/g, ""); if (input.dataset.month === "total") { var value = event.target.value.replace(/[^0-9.]/g, ""), dot = value.indexOf("."); if (dot >= 0) value = value.slice(0, dot + 1) + value.slice(dot + 1).replace(/\./g, ""); event.target.value = value; } update(); }); });
        row.querySelector('[data-month="slot"]').addEventListener("change", update);
        row.querySelector("[data-month-remove]").addEventListener("click", function () {
          var sameSlot = categories.filter(function (item) { return item.slot === category.slot; });
          if (sameSlot.length <= 1) { status.textContent = "أبقِ خانة واحدة على الأقل لكل امتحان."; status.classList.add("error"); return; }
          var book = appBook();
          if (hasMarks(book, [category]) && !window.confirm("تحتوي هذه الخانة على درجات محفوظة. حذفها سيحذف تلك الدرجات من جميع الشعب. هل تريد المتابعة؟")) return;
          categories = readForm().filter(function (item) { return item.id !== category.id; }); draw(); update();
        });
        grid.appendChild(row);
      });
      update();
    }
    function readForm() { return Array.from(grid.querySelectorAll(".monthly-scheme-row")).map(function (row) { return { id: row.dataset.id, name: row.querySelector('[data-month="name"]').value.trim(), slot: row.querySelector('[data-month="slot"]').value, count: Number(row.querySelector('[data-month="count"]').value), total: Number(row.querySelector('[data-month="total"]').value) || 0 }; }); }
    function update() {
      if (!grid.children.length) return;
      categories = readForm();
      groups.innerHTML = "";
      slots.forEach(function (slot) { var sum = categories.filter(function (item) { return item.slot === slot[0]; }).reduce(function (n, item) { return n + (Number(item.total) || 0); }, 0); var card = document.createElement("div"); card.className = "monthly-scheme-group"; card.textContent = slot[1] + " · " + (Math.round(sum * 10) / 10) + "%"; card.classList.toggle("is-valid", Math.abs(sum - 100) < .001); groups.appendChild(card); });
      var result = window.SijilMonthlyBreakdown.validate(categories);
      total.textContent = result.ok ? "كل امتحان موزّع بالكامل (100%)." : result.reason;
      total.classList.toggle("is-valid", result.ok); total.classList.toggle("is-invalid", !result.ok);
      status.classList.remove("error");
    }
    section.querySelector("[data-monthly-add]").addEventListener("click", function () {
      if (categories.length >= 24) { status.textContent = "يمكن إضافة 24 خانة كحد أقصى."; status.classList.add("error"); return; }
      categories = readForm(); categories.push({ id: "custom-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7), slot: "a1", name: "درجة إضافية", count: 1, total: 0 }); draw();
      grid.lastElementChild.querySelector('[data-month="name"]').focus();
    });
    section.querySelector("[data-monthly-apply]").addEventListener("click", function () {
      var list = readForm(), result = window.SijilMonthlyBreakdown.validate(list);
      if (!result.ok) { status.textContent = result.reason; status.classList.add("error"); return; }
      if (result.hasRemovedMarks && !window.confirm("تحتوي بعض الخانات المحذوفة على درجات محفوظة؛ ستُحذف هذه الدرجات من كل الشعب. هل تريد المتابعة؟")) return;
      window.SijilMonthlyBreakdown.apply(list); categories = list; status.textContent = "تم حفظ توزيع درجات الشهرية."; status.classList.remove("error");
    });
    section.querySelector("[data-monthly-reset]").addEventListener("click", function () { if (hasMarks(appBook(), categories) && !window.confirm("استعادة الافتراضي قد تحذف درجات الخانات الإضافية. هل تريد المتابعة؟")) return; categories = clone(defaults); draw(); });
    draw();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true }); else mount();
})();
