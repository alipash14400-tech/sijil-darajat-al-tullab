(function () {
  "use strict";

  var PROFILE_KEY = "student-grades-onboarding-v2";
  var DRAFT_KEY = "student-grades-onboarding-draft-v2";
  var OLD_PROFILE_KEY = "student-grades-onboarding-v1";
  var strings = {
    ar: {
      welcome: "مرحبًا بك في سجل درجات الطلاب", intro: "سنجهّز بياناتك خطوة خطوة لتبدأ إعداد سجلاتك بسهولة.", start: "لنبدأ", back: "رجوع", next: "التالي", finish: "حفظ وبدء الاستخدام", step: "من",
      questions: ["كيف نعرّفك؟", "ما اسمك؟", "ما اسم المدرسة ونوعها؟", "من مدير/ة المدرسة؟", "ما المادة التي تدرّسها؟", "ما مرحلتك وصفك الدراسي؟", "اختر مديرية التربية"],
      hints: ["اختر الخيار المناسب، وسنضبط صياغة التطبيق تلقائيًا.", "سيظهر اسمك تلقائيًا في ترويسة السجلات.", "اكتب اسم المدرسة واختر بنين أو بنات لتتغير تسميات الطلبة في البحث والجداول.", "اختر المدير أو المديرة، وسنغيّر تسمية الاسم تلقائيًا.", "يمكنك تغيير المادة لاحقًا عند إنشاء أي سجل.", "اختر المرحلة أولًا، ثم الصف الدراسي.", "اختر الأقرب أو اكتب اسم مديريتك."],
      teacher: "معلم", teacheress: "معلمة", instructor: "مدرس", instructress: "مدرسة", roleNames: { teacher: "المعلم", teacheress: "المعلمة", instructor: "المدرس", instructress: "المدرسة" }, principalRoles: { principal: "مدير المدرسة", principaless: "مديرة المدرسة" }, principalOptions: { principal: "مدير", principaless: "مديرة" }, schoolOptions: { boys: "مدرسة بنين", girls: "مدرسة بنات" }, schoolType: "نوع المدرسة", name: "الاسم الكامل", school: "اسم المدرسة", principal: "الاسم", subject: "المادة، مثال: الرياضيات", stage: "المرحلة الدراسية", grade: "الصف الدراسي", chooseStage: "اختر المرحلة الدراسية", chooseGrade: "اختر الصف", directorate: "اختر مديرية التربية", other: "إدارة أخرى / كتابة الاسم", requiredRole: "اختر معلمًا أو معلمة أو مدرسًا أو مدرسة للمتابعة.", requiredSchoolGender: "اختر مدرسة بنين أو مدرسة بنات للمتابعة.", requiredPrincipalRole: "اختر مدير المدرسة أو مديرة المدرسة للمتابعة.", requiredName: "اكتب اسمك للمتابعة.", requiredSchool: "اكتب اسم المدرسة للمتابعة.", requiredPrincipal: "اكتب اسم المدير أو المديرة للمتابعة.", requiredSubject: "اكتب المادة التي تدرّسها للمتابعة.", requiredGrade: "اختر المرحلة والصف للمتابعة.", requiredDirectorate: "اختر مديرية التربية للمتابعة.",
      directorates: ["الأنبار", "أربيل", "البصرة", "بابل", "بغداد / الكرخ الأولى", "بغداد / الكرخ الثانية", "بغداد / الكرخ الثالثة", "بغداد / الرصافة الأولى", "بغداد / الرصافة الثانية", "بغداد / الرصافة الثالثة", "دهوك", "ديالى", "ذي قار", "السليمانية", "صلاح الدين", "كربلاء", "كركوك", "ميسان", "المثنى", "النجف", "نينوى", "واسط"]
    },
    en: {
      welcome: "Welcome to Student Grade Register", intro: "We’ll set up your details step by step so you can start your registers.", start: "Get started", back: "Back", next: "Next", finish: "Save and continue", step: "of",
      questions: ["How should we address you?", "What is your name?", "What is the school name and type?", "Who is the school principal?", "Which subject do you teach?", "What is your study stage and grade?", "Choose your education directorate"],
      hints: ["Choose an option and we’ll personalize the wording.", "Your name will appear in the register header.", "Enter the school name and choose boys or girls to update student labels.", "Choose the principal title; the name field will update automatically.", "You can change the subject for any register later.", "Choose the stage first, then the grade.", "Choose the nearest option or type your directorate."],
      teacher: "Teacher", teacheress: "Teacher (female)", instructor: "Instructor", instructress: "Instructor (female)", roleNames: { teacher: "teacher", teacheress: "teacher", instructor: "instructor", instructress: "instructor" }, principalRoles: { principal: "school principal", principaless: "female school principal" }, principalOptions: { principal: "Principal", principaless: "Female principal" }, schoolOptions: { boys: "Boys’ school", girls: "Girls’ school" }, schoolType: "School type", name: "Full name", school: "School name", principal: "Principal’s name", subject: "Subject, e.g. Mathematics", stage: "Study stage", grade: "Grade", chooseStage: "Choose a study stage", chooseGrade: "Choose a grade", directorate: "Choose an education directorate", other: "Other / enter a name", requiredRole: "Choose a teacher or instructor to continue.", requiredSchoolGender: "Choose a boys’ or girls’ school to continue.", requiredPrincipalRole: "Choose the school principal title to continue.", requiredName: "Enter your name to continue.", requiredSchool: "Enter your school name to continue.", requiredPrincipal: "Enter the principal’s name to continue.", requiredSubject: "Enter your teaching subject to continue.", requiredGrade: "Choose a study stage and grade to continue.", requiredDirectorate: "Choose your education directorate to continue.",
      directorates: ["Anbar", "Erbil", "Basra", "Babil", "Baghdad / Karkh 1", "Baghdad / Karkh 2", "Baghdad / Karkh 3", "Baghdad / Rusafa 1", "Baghdad / Rusafa 2", "Baghdad / Rusafa 3", "Dohuk", "Diyala", "Dhi Qar", "Sulaymaniyah", "Salah al-Din", "Karbala", "Kirkuk", "Maysan", "Muthanna", "Najaf", "Nineveh", "Wasit"]
    }
  };

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || "null"); }
    catch (_) { return null; }
  }
  function escape(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char];
    });
  }
  function currentFields() {
    function value(id) {
      var node = document.getElementById(id);
      return node ? node.value.trim() : "";
    }
    var old = read(PROFILE_KEY) || read(OLD_PROFILE_KEY) || {};
    return { role: old.role || "", schoolGender: old.schoolGender || "", principalRole: old.principalRole || "", name: value("m-teacher") || old.name || "", school: value("m-school") || old.school || "", principal: value("m-principal") || old.principal || "", subject: value("m-subject") || old.subject || "", directorate: value("m-directorate") || old.directorate || "", stage: value("stage-select") || String(old.stage || ""), grade: value("grade-select") || String(old.grade || "") };
  }

  var layer = document.createElement("div");
  layer.className = "onboarding-layer";
  layer.hidden = true;
  layer.setAttribute("role", "dialog");
  layer.setAttribute("aria-modal", "true");
  layer.setAttribute("aria-labelledby", "onboarding-title");
  layer.innerHTML = '<section class="onboarding-welcome"><div class="onboarding-card onboarding-welcome-card"><div class="onboarding-mark" aria-hidden="true">▤<i>✦</i></div><h1 id="onboarding-title"></h1><p class="onboarding-subtitle"></p></div><button type="button" class="onboarding-primary" id="onboarding-start"></button></section>' +
    '<section class="onboarding-wizard" hidden><header class="onboarding-progress"><div><span id="onboarding-step-count"></span><div class="onboarding-progress-track"><span id="onboarding-progress-bar"></span></div></div><button class="onboarding-back" type="button" id="onboarding-back"></button></header><div class="onboarding-card onboarding-question"><div class="onboarding-question-icon" id="onboarding-icon" aria-hidden="true"></div><h1 id="onboarding-question-title"></h1><p class="onboarding-subtitle" id="onboarding-hint"></p><div class="onboarding-fields" id="onboarding-fields"></div><p class="onboarding-error" id="onboarding-error" role="alert"></p></div><button type="button" class="onboarding-primary onboarding-next" id="onboarding-next"></button></section>';
  document.body.appendChild(layer);

  var welcome = layer.querySelector(".onboarding-welcome");
  var wizard = layer.querySelector(".onboarding-wizard");
  var fieldsBox = document.getElementById("onboarding-fields");
  var errorBox = document.getElementById("onboarding-error");
  var step = 0;
  var editingProfile = false;
  var draft = Object.assign(currentFields(), read(DRAFT_KEY) || {});
  var icons = ['<img class="person-icon" src="./person-male.png" alt="">', '<img class="person-icon" src="./person-male.png" alt="">', '<img class="person-icon" src="./person-male.png" alt="">', '<img class="person-icon" src="./person-male.png" alt="">', "▤", "▦", "⌂"];
  function isFemaleRole(role) { return role === "teacheress" || role === "instructress"; }
  function isFemalePrincipal(role) { return role === "principaless"; }
  function schoolStudentTerms(profile) { return profile && profile.schoolGender === "girls" ? { singular: "الطالبة", plural: "الطالبات", group: "الطالبات" } : { singular: "الطالب", plural: "الطلاب", group: "الطلاب" }; }
  function setLabelText(controlId, text) {
    var control = document.getElementById(controlId), label = control && control.closest("label");
    if (!label) return;
    Array.prototype.some.call(label.childNodes, function (node) { if (node.nodeType === 3 && node.textContent.trim()) { node.textContent = text; return true; } return false; });
  }
  function updateProfileLabels(profile) {
    var t = language();
    var teacherTitle = t.roleNames[profile.role] || t.roleNames.instructor;
    var principalTitle = t.principalRoles[profile.principalRole] || t.principalRoles.principal;
    setLabelText("m-teacher", document.documentElement.lang === "en" ? "Name of " + teacherTitle : "اسم " + teacherTitle);
    setLabelText("m-principal", document.documentElement.lang === "en" ? "Name of " + principalTitle : "اسم " + principalTitle);
    var accountLabel = document.querySelector('label[for="account-teacher-name"]');
    if (accountLabel) accountLabel.textContent = document.documentElement.lang === "en" ? "Name of " + teacherTitle : "اسم " + teacherTitle;
    var accountInput = document.getElementById("account-teacher-name");
    if (accountInput) accountInput.placeholder = document.documentElement.lang === "en" ? "Enter the " + teacherTitle + "’s name" : "الاسم الثلاثي أو اسم " + teacherTitle;
  }

  function language() {
    return strings[document.documentElement.lang === "en" ? "en" : "ar"];
  }
  function saveDraft() {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch (_) {}
  }
  function gradeOptionsFor(stage) {
    var counts = [6, 3, 6, 3], words = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس"];
    if (stage === 3) return ["الصف الرابع الإعدادي", "الصف الخامس الإعدادي", "الصف السادس الإعدادي"];
    var suffix = stage === 0 ? "الابتدائي" : (stage === 1 ? "المتوسط" : "الثانوي");
    return words.slice(0, counts[stage] || 0).map(function (word) { return "الصف " + word + " " + suffix; });
  }
  function field(label, id, value, placeholder, type) {
    return '<label class="onboarding-label" for="' + id + '">' + label + '<input class="onboarding-input" id="' + id + '" type="' + (type || "text") + '" value="' + escape(value) + '" placeholder="' + escape(placeholder || "") + '" autocomplete="' + (id === "onboarding-name" ? "name" : "organization") + '"></label>';
  }
  function renderStep() {
    var t = language();
    layer.dir = document.documentElement.dir || "rtl";
    var currentStage = document.getElementById("stage-select");
    var stageChoices = currentStage ? Array.prototype.map.call(currentStage.options, function (option) { return { value: option.value, label: option.textContent }; }) : [];
    var selectedStage = String(draft.stage == null ? "" : draft.stage);
    var gradeLabels = selectedStage !== "" ? gradeOptionsFor(Number(selectedStage)) : [];
    var panels = [
      '<div class="onboarding-role-options"><button type="button" class="onboarding-role" data-role="teacher"><span><img class="person-icon" src="./person-male.png" alt=""></span><strong>' + t.teacher + '</strong></button><button type="button" class="onboarding-role" data-role="teacheress"><span><img class="person-icon" src="./person-female.png" alt=""></span><strong>' + t.teacheress + '</strong></button><button type="button" class="onboarding-role" data-role="instructor"><span><img class="person-icon" src="./person-male.png" alt=""></span><strong>' + t.instructor + '</strong></button><button type="button" class="onboarding-role" data-role="instructress"><span><img class="person-icon" src="./person-female.png" alt=""></span><strong>' + t.instructress + '</strong></button></div>',
      field(step === 1 && draft.role ? (document.documentElement.lang === "en" ? "Name of " + t.roleNames[draft.role] : "اسم " + t.roleNames[draft.role]) : t.name, "onboarding-name", draft.name, step === 1 && draft.role ? (document.documentElement.lang === "en" ? "Enter the " + t.roleNames[draft.role] + "’s name" : "اكتب اسم " + t.roleNames[draft.role]) : t.name),
      field(t.school, "onboarding-school", draft.school, t.school) + '<div class="onboarding-role-options onboarding-school-options" role="group" aria-label="' + t.schoolType + '"><button type="button" class="onboarding-role" data-school-gender="boys"><span><img class="person-icon" src="./person-male.png" alt=""></span><strong>' + t.schoolOptions.boys + '</strong></button><button type="button" class="onboarding-role" data-school-gender="girls"><span><img class="person-icon" src="./person-female.png" alt=""></span><strong>' + t.schoolOptions.girls + '</strong></button></div>',
      '<div class="onboarding-role-options onboarding-principal-options"><button type="button" class="onboarding-role" data-principal-role="principal"><span><img class="person-icon" src="./person-male.png" alt=""></span><strong>' + t.principalOptions.principal + '</strong></button><button type="button" class="onboarding-role" data-principal-role="principaless"><span><img class="person-icon" src="./person-female.png" alt=""></span><strong>' + t.principalOptions.principaless + '</strong></button></div>' + field(draft.principalRole && t.principalRoles[draft.principalRole] ? (document.documentElement.lang === "en" ? "Name of the " + t.principalRoles[draft.principalRole] : "اسم " + t.principalRoles[draft.principalRole]) : t.principal, "onboarding-principal", draft.principal, draft.principalRole && t.principalRoles[draft.principalRole] ? (document.documentElement.lang === "en" ? "Enter the " + t.principalRoles[draft.principalRole] + "’s name" : "اكتب اسم " + t.principalRoles[draft.principalRole]) : t.principal),
      field(t.subject, "onboarding-subject", draft.subject, t.subject),
      '<div class="onboarding-selects"><label class="onboarding-label" for="onboarding-stage">' + t.stage + '<select class="onboarding-input" id="onboarding-stage"><option value="">' + t.chooseStage + '</option>' + stageChoices.map(function (option) { return '<option value="' + escape(option.value) + '" ' + (option.value === selectedStage ? 'selected' : '') + '>' + escape(option.label) + '</option>'; }).join("") + '</select></label><label class="onboarding-label" for="onboarding-grade">' + t.grade + '<select class="onboarding-input" id="onboarding-grade" ' + (selectedStage ? '' : 'disabled') + '><option value="">' + (selectedStage ? t.chooseGrade : t.chooseStage) + '</option>' + gradeLabels.map(function (label, index) { return '<option value="' + index + '" ' + (String(index) === String(draft.grade) ? 'selected' : '') + '>' + escape(label) + '</option>'; }).join("") + '</select></label></div>',
      '<label class="onboarding-label" for="onboarding-directorate">' + t.directorate + '<select class="onboarding-input" id="onboarding-directorate"><option value="">' + t.directorate + '</option>' + t.directorates.map(function (item) { return '<option value="' + escape(item) + '" ' + (draft.directorate === item ? 'selected' : '') + '>' + escape(item) + '</option>'; }).join("") + '<option value="__other" ' + (draft.directorate && t.directorates.indexOf(draft.directorate) < 0 ? 'selected' : '') + '>' + t.other + '</option></select><input class="onboarding-input" id="onboarding-directorate-other" data-profile-key="directorate" value="' + escape(t.directorates.indexOf(draft.directorate) < 0 ? draft.directorate : '') + '" placeholder="' + t.other + '" autocomplete="organization" ' + (draft.directorate && t.directorates.indexOf(draft.directorate) < 0 ? '' : 'hidden') + '></label>'
    ];
    document.getElementById("onboarding-step-count").textContent = (step + 1) + " " + t.step + " 7";
    document.getElementById("onboarding-progress-bar").style.width = ((step + 1) / 7 * 100) + "%";
    var question = t.questions[step];
    if (step === 1 && draft.role && t.roleNames[draft.role]) question = document.documentElement.lang === "en" ? "What is the name of " + t.roleNames[draft.role] + "?" : "ما اسم " + t.roleNames[draft.role] + "؟";
    if (step === 3 && draft.principalRole && t.principalRoles[draft.principalRole]) question = document.documentElement.lang === "en" ? "What is the name of the " + t.principalRoles[draft.principalRole] + "?" : "ما اسم " + t.principalRoles[draft.principalRole] + "؟";
    if (step === 1) icons[1] = '<img class="person-icon" src="./person-' + (isFemaleRole(draft.role) ? "female" : "male") + '.png" alt="">';
    if (step === 2) icons[2] = '<img class="person-icon" src="./person-' + (draft.schoolGender === "girls" ? "female" : "male") + '.png" alt="">';
    if (step === 3) icons[3] = '<img class="person-icon" src="./person-' + (isFemalePrincipal(draft.principalRole) ? "female" : "male") + '.png" alt="">';
    document.getElementById("onboarding-question-title").textContent = question;
    document.getElementById("onboarding-hint").textContent = t.hints[step];
    document.getElementById("onboarding-icon").innerHTML = icons[step];
    document.getElementById("onboarding-back").textContent = "› " + t.back;
    document.getElementById("onboarding-next").textContent = step === 6 ? t.finish : t.next + "  ←";
    errorBox.textContent = "";
    fieldsBox.innerHTML = panels[step];
    if (step === 0 && draft.role) { var selectedRole = fieldsBox.querySelector('[data-role="' + draft.role + '"]'); if (selectedRole) selectedRole.classList.add("selected"); }
    if (step === 2 && draft.schoolGender) { var selectedSchoolType = fieldsBox.querySelector('[data-school-gender="' + draft.schoolGender + '"]'); if (selectedSchoolType) selectedSchoolType.classList.add("selected"); }
    if (step === 3 && draft.principalRole) { var selectedPrincipal = fieldsBox.querySelector('[data-principal-role="' + draft.principalRole + '"]'); if (selectedPrincipal) selectedPrincipal.classList.add("selected"); }
    if (step === 5) {
      var stageInput = document.getElementById("onboarding-stage");
      var gradeInput = document.getElementById("onboarding-grade");
      stageInput.addEventListener("change", function () {
        draft.stage = stageInput.value;
        draft.grade = "";
        var labels = stageInput.value !== "" ? gradeOptionsFor(Number(stageInput.value)) : [];
        gradeInput.disabled = !stageInput.value;
        gradeInput.innerHTML = '<option value="">' + (stageInput.value ? t.chooseGrade : t.chooseStage) + '</option>' + labels.map(function (label, index) { return '<option value="' + index + '">' + escape(label) + '</option>'; }).join("");
        saveDraft();
      });
      gradeInput.addEventListener("change", function () { draft.grade = gradeInput.value; saveDraft(); });
    }
    if (step === 6) {
      var directorateSelect = document.getElementById("onboarding-directorate");
      var otherDirectorate = document.getElementById("onboarding-directorate-other");
      directorateSelect.addEventListener("change", function () {
        var isOther = directorateSelect.value === "__other";
        otherDirectorate.hidden = !isOther;
        if (isOther) { otherDirectorate.focus(); draft.directorate = otherDirectorate.value.trim(); }
        else draft.directorate = directorateSelect.value;
        saveDraft();
      });
    }
    fieldsBox.querySelectorAll("input").forEach(function (input) { input.addEventListener("input", function () { draft[input.dataset.profileKey || input.id.replace("onboarding-", "")] = input.value; saveDraft(); }); });
    fieldsBox.querySelectorAll("[data-role]").forEach(function (button) {
      button.addEventListener("click", function () {
        draft.role = button.dataset.role;
        fieldsBox.querySelectorAll("[data-role]").forEach(function (item) { item.classList.toggle("selected", item === button); });
        saveDraft();
      });
    });
    fieldsBox.querySelectorAll("[data-principal-role]").forEach(function (button) {
      button.addEventListener("click", function () {
        draft.principalRole = button.dataset.principalRole;
        saveDraft();
        renderStep();
        var principalInput = document.getElementById("onboarding-principal");
        if (principalInput) principalInput.focus();
      });
    });
    fieldsBox.querySelectorAll("[data-school-gender]").forEach(function (button) {
      button.addEventListener("click", function () {
        draft.schoolGender = button.dataset.schoolGender;
        fieldsBox.querySelectorAll("[data-school-gender]").forEach(function (item) { item.classList.toggle("selected", item === button); });
        saveDraft();
      });
    });
  }

  function showWizard() {
    welcome.hidden = true;
    wizard.hidden = false;
    renderStep();
  }
  function applyProfile(profile, updateMatchingValues, previousProfile) {
    var app = window.SijilApp;
    if (!app || typeof app.getBook !== "function" || typeof app.replaceBook !== "function") return;
    var previous = previousProfile || read(PROFILE_KEY) || {};
    var book = app.getBook();
    if (profile.stage !== "" && profile.grade !== "") {
      book.activeStage = Math.max(0, Math.min(3, Number(profile.stage) || 0));
      var limits = [6, 3, 6, 3];
      book.activeGrade = Math.max(0, Math.min(limits[book.activeStage] - 1, Number(profile.grade) || 0));
      book.activeBranch = 0;
    }
    var keys = { name: "teacher", school: "school", principal: "principal", subject: "subject", directorate: "directorate" };
    (book.grades || []).forEach(function (grade) {
      (grade.sections || []).forEach(function (section) {
        section.meta = section.meta || {};
        Object.keys(keys).forEach(function (profileKey) {
          var metaKey = keys[profileKey];
          var current = String(section.meta[metaKey] || "").trim();
          if ((!current || (updateMatchingValues && current === String(previous[profileKey] || "").trim())) && profile[profileKey]) section.meta[metaKey] = profile[profileKey];
        });
      });
    });
    app.replaceBook(book);
    if (window.SijilAccount && window.SijilAccount.queueBook) window.SijilAccount.queueBook(app.getBook());
  }
  function complete() {
    var profile = { role: draft.role, schoolGender: draft.schoolGender, principalRole: draft.principalRole, name: String(draft.name || "").trim(), school: String(draft.school || "").trim(), principal: String(draft.principal || "").trim(), subject: String(draft.subject || "").trim(), stage: String(draft.stage || ""), grade: String(draft.grade || ""), directorate: String(draft.directorate || "").trim(), completedAt: Date.now() };
    var previousProfile = read(PROFILE_KEY) || {};
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); localStorage.removeItem(DRAFT_KEY); } catch (_) {}
    applyProfile(profile, editingProfile, previousProfile);
    updateProfileLabels(profile);
    var accountName = document.getElementById("account-teacher-name");
    if (accountName && !accountName.value) accountName.value = profile.name;
    window.dispatchEvent(new CustomEvent("sijil-profile-role", { detail: { role: profile.role, principalRole: profile.principalRole } }));
    window.dispatchEvent(new CustomEvent("sijil-profile-updated", { detail: profile }));
    editingProfile = false;
    layer.hidden = true;
  }
  function openEditor() {
    var saved = read(PROFILE_KEY) || read(OLD_PROFILE_KEY) || {};
    draft = Object.assign({}, saved, currentFields());
    step = 0;
    editingProfile = true;
    saveDraft();
    welcome.hidden = true;
    wizard.hidden = false;
    layer.hidden = false;
    renderStep();
  }
  function next() {
    var t = language();
    if (step === 0 && !draft.role) { errorBox.textContent = t.requiredRole; return; }
    if (step === 1 && !String(draft.name || "").trim()) { errorBox.textContent = t.requiredName; return; }
    if (step === 2 && !String(draft.school || "").trim()) { errorBox.textContent = t.requiredSchool; return; }
    if (step === 2 && !draft.schoolGender) { errorBox.textContent = t.requiredSchoolGender; return; }
    if (step === 3 && !draft.principalRole) { errorBox.textContent = t.requiredPrincipalRole; return; }
    if (step === 3 && !String(draft.principal || "").trim()) { errorBox.textContent = t.requiredPrincipal; return; }
    if (step === 4 && !String(draft.subject || "").trim()) { errorBox.textContent = t.requiredSubject; return; }
    if (step === 5 && (!String(draft.stage || "").trim() || !String(draft.grade || "").trim())) { errorBox.textContent = t.requiredGrade; return; }
    if (step === 6 && !String(draft.directorate || "").trim()) { errorBox.textContent = t.requiredDirectorate; return; }
    if (step === 6) { complete(); return; }
    step++;
    saveDraft();
    renderStep();
  }
  document.getElementById("onboarding-start").addEventListener("click", showWizard);
  document.getElementById("onboarding-next").addEventListener("click", next);
  document.getElementById("onboarding-back").addEventListener("click", function () {
    if (step === 0) { if (editingProfile) { editingProfile = false; layer.hidden = true; try { localStorage.removeItem(DRAFT_KEY); } catch (_) {} return; } wizard.hidden = true; welcome.hidden = false; return; }
    step--;
    saveDraft();
    renderStep();
  });

  function maybeStart() {
    var savedProfile = read(PROFILE_KEY);
    if (savedProfile) updateProfileLabels(savedProfile);
    if (layer.hidden === false || savedProfile) return;
    if (document.documentElement.classList.contains("license-locked")) { window.setTimeout(maybeStart, 700); return; }
    var t = language();
    document.getElementById("onboarding-title").textContent = t.welcome;
    document.querySelector(".onboarding-welcome .onboarding-subtitle").textContent = t.intro;
    document.getElementById("onboarding-start").textContent = t.start + "  ←";
    layer.dir = document.documentElement.dir || "rtl";
    layer.hidden = false;
  }
  window.SijilOnboarding = { openEditor: openEditor, getProfile: function () { return read(PROFILE_KEY) || read(OLD_PROFILE_KEY) || {}; } };
  window.setTimeout(maybeStart, 250);
})();
