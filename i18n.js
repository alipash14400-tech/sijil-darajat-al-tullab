(function () {
  "use strict";
  var STORAGE_KEY = "student-grades-language-v1";
  var translations = {
    "سجل درجات الطلاب": "Student Grade Register",
    "سجل الدرجات": "Grade Register",
    "تفعيل سجل درجات الطلاب": "Activate Student Grade Register",
    "أدخل كود التفعيل المخصص لك. كل كود يُفعّل على جهاز واحد.": "Enter your activation code. Each code works on one device.",
    "كود التفعيل": "Activation code",
    "تفعيل التطبيق": "Activate App",
    "أدخل كود التفعيل المخصص لهذا الجهاز.": "Enter the activation code assigned to this device.",
    "نظام الأكواد جاهز، لكنه يحتاج ربط خدمة التفعيل قبل تشغيله.": "The code system is ready, but the activation service must be connected first.",
    "أدخل كود التفعيل أولًا.": "Enter the activation code first.",
    "جارٍ ربط الكود بهذا الجهاز…": "Linking the code to this device…",
    "تم تفعيل التطبيق على هذا الجهاز.": "The app is activated on this device.",
    "وصل رد تفعيل غير موثوق. لم يُحفظ الكود.": "The activation response could not be verified. The code was not saved.",
    "تعذر حفظ معرّف هذا الجهاز. اسمح للموقع بحفظ البيانات ثم أعد المحاولة.": "Could not save this device ID. Allow site storage and try again.",
    "يلزم الإنترنت للتفعيل الأول. بعد نجاح التفعيل، يمكن فتح التطبيق دون إنترنت ما دامت بيانات هذا الموقع محفوظة على الجهاز.": "Internet is required for first activation. After activation, the app can work offline while this site's data remains saved on the device.",
    "الدراسة": "Study level",
    "اختيار المرحلة الدراسية": "Choose study level",
    "الدراسة الابتدائية": "Primary",
    "الدراسة المتوسطة": "Intermediate",
    "الدراسة الثانوية": "Secondary",
    "الدراسة الإعدادية": "Preparatory",
    "الفرع": "Branch",
    "اختيار الفرع": "Choose branch",
    "العلمي": "Science",
    "الأدبي": "Literature",
    "الصف": "Grade",
    "اختيار الصف": "Choose grade",
    "اختيار الشعبة": "Choose section",
    "الشعب": "Sections",
    "الشعبة": "Section",
    "المادة": "Subject",
    "المدرس": "Teacher",
    "اسم المدرس/ة": "Teacher Name",
    "الطالب/ة": "Student",
    "اسم المدرسة": "School Name",
    "اسم المدرسة وتاريخ الدراسة": "School Name and Academic Year",
    "تاريخ الدراسة": "Academic year",
    "بحث عن طالب": "Search for a student",
    "بحث عن طالب/ة": "Search for a student",
    "اكتب اسم الطالب": "Enter a student name",
    "اكتب اسم الطالب/ة": "Enter a student name",
    "يومي الفصل الأول": "First Semester Daily",
    "يومي الفصل الثاني": "Second Semester Daily",
    "الدرجات الشهرية": "Monthly Grades",
    "حفظ": "Save",
    "تم الحفظ ✓": "Saved ✓",
    "مشاركة / طباعة PDF": "Share / Print PDF",
    "إضافة طالب": "Add Student",
    "تحقق من التحديث": "Check for Updates",
    "تحقق من تحديث Android": "Check Android update",
    "تحميل APK Android": "Download Android APK",
    "تثبيت التطبيق": "Install App",
    "اختر المنصة أو افتح رابط التطبيق.": "Choose a platform or open the app link.",
    "Android - تحميل APK": "Android - Download APK",
    "على iPhone: افتح الرابط في Safari، اضغط «مشاركة»، ثم اختر «إضافة إلى الشاشة الرئيسية».": "On iPhone: open the link in Safari, tap Share, then choose Add to Home Screen.",
    "للتثبيت من المتصفح: افتح الرابط في Chrome واضغط القائمة ⋮ ثم «تثبيت التطبيق». لتنزيل نسخة Android اختر تحميل APK.": "To install from the browser, open the link in Chrome, tap ⋮, then Install app. To download the Android installer, choose Download APK.",
    "تنزيل نسخة احتياطية": "Download Backup",
    "استعادة نسخة احتياطية": "Restore Backup",
    "تفريغ الطلاب والدرجات": "Clear Students and Grades",
    "اختر الدراسة الابتدائية أو المتوسطة أو الثانوية، ويظهر الفرع العلمي أو الأدبي من الصف الرابع الثانوي. كما تتوفر الدراسة الإعدادية من الرابع إلى السادس بفرعيها. لكل شعبة طلاب ودرجات مستقلة، وترقيم الطلاب يبدأ من 1 داخل كل شعبة. تُحفظ البيانات تلقائيًا في هذا المتصفح. أعلى درجة لكل خانة من خانات الدفتر والمشاركة اليومية هي 5 (المجموع 25 لكل منهما)، والسلوك والنشاط وكل امتحان 10، وتُجمع كلها تلقائياً في درجة اليومي النهائية من 100. في الصفحة الشهرية: اليومي يُسحب تلقائياً من يومي الفصل الأول، والفصل = (الشهر الأول + الشهر الثاني + اليومي) ÷ 3. اليومي في الفصل الأول يأتي من الصفحة الأولى، وفي الفصل الثاني من صفحة «يومي الفصل الثاني».": "Choose Primary, Intermediate, or Secondary. Science and Literature branches are available from Secondary Grade 4. Preparatory study includes Grades 4–6 in both branches. Each section has its own students and grades, numbered from 1. Data is saved automatically in this browser. The notebook and daily participation items are each scored out of 5 (25 points total for each group); conduct, activities, and each exam are scored out of 10. Together they form the final daily grade out of 100. On the monthly grades page, the daily grade is filled from the First Semester Daily page. Each semester grade is the average of Month 1, Month 2, and the daily grade. The second semester daily grade comes from its own page.",
    "ملف الدرجات جاهز": "Your grade report is ready",
    "اختر مشاركة ملف PDF للطباعة، ثم اختر طباعة من قائمة المشاركة.": "Choose Share PDF for Printing, then choose Print from the share menu.",
    "مشاركة ملف PDF للطباعة": "Share PDF for Printing",
    "حفظ PDF بالملفات": "Save PDF to Files",
    "إغلاق": "Close",
    "إعداد الحساب السحابي غير مكتمل. يلزم إعداد مشروع Firebase أولًا.": "Cloud account setup is incomplete. A Firebase project must be configured first.",
    "يتوفر تحديث للتطبيق. حدّثه الآن لتطبيق التغييرات.": "An app update is available. Update now to apply the changes.",
    "تحديث الآن": "Update Now",
    "لاحقًا": "Later",
    "الرقم": "No.",
    "الاسم": "Name",
    "دفتر": "Notebook",
    "مشاركة يومية": "Daily Participation",
    "سلوك": "Conduct",
    "نشاط لا صفي": "Extracurricular Activity",
    "امتحان الأول": "First Exam",
    "امتحان الثاني": "Second Exam",
    "امتحان الثالث": "Third Exam",
    "الشهر الأول": "Month 1",
    "الشهر الثاني": "Month 2",
    "اليومي": "Daily",
    "الفصل الأول": "Semester 1",
    "نصف السنة": "Midyear Exam",
    "الفصل الثاني": "Semester 2",
    "السعي السنوي": "Annual Coursework",
    "امتحان النهائي": "Final Exam",
    "درجة اليومي النهائية (من 100)": "Final Daily Grade (out of 100)",
    "تغيير الاسم": "Rename",
    "إلغاء": "Cancel",
    "تعذر تحميل أداة تجهيز PDF. افتح التطبيق مع الإنترنت مرة واحدة لتحديثه ثم أعد المحاولة.": "Could not load the PDF tool. Open the app online once to update it, then try again.",
    "جار تجهيز PDF…": "Preparing PDF…",
    "اختر «مشاركة ملف PDF للطباعة»، ثم اختر «طباعة» من قائمة المشاركة.": "Choose “Share PDF for Printing”, then choose “Print” from the share menu.",
    "تعذر تجهيز ملف PDF. حاول تقليل عدد الطلاب الظاهرين في البحث ثم أعد المحاولة.": "Could not prepare the PDF. Show fewer students using search and try again.",
    "تعذرت المشاركة الآن. اضغط «حفظ PDF بالملفات» ثم افتح الملف واضغط مشاركة ← طباعة.": "Sharing is unavailable now. Tap “Save PDF to Files”, open the file, then choose Share → Print.",
    "المشاركة المباشرة غير متاحة في هذا الإصدار. احفظ الملف ثم افتحه من تطبيق الملفات واضغط مشاركة ← طباعة.": "Direct sharing is unavailable in this version. Save the file, open it in Files, then choose Share → Print.",
    "نسخة-احتياطية-سجل-الدرجات-": "student-grades-backup-",
    "حقوق تطبيق سجل درجات الطلاب - علي بهار العبودي": "Student Grade Register app credits - Ali Bahar Al-Aboudi",
    "بياناتك محفوظة على هذا الجهاز فقط. أنشئ حسابًا لمزامنتها بين أجهزتك.": "Your data is saved on this device only. Create an account to sync it across your devices.",
    "إنشاء حساب / تسجيل الدخول": "Create Account / Sign In",
    "إدارة الحساب": "Manage Account",
    "تسجيل الخروج": "Sign Out",
    "حسابك ومزامنة البيانات": "Your Account and Data Sync",
    "الإعدادات": "Settings",
    "اللغة": "Language",
    "اختيار اللغة": "Choose language",
    "تحميل وتثبيت التطبيق": "Download and Install the App",
    "ثبّت سجل درجات الطلاب على شاشة هاتفك وافتحه كتطبيق.": "Install Student Grade Register on your phone's home screen and open it as an app.",
    "Android": "Android",
    "افتح التطبيق في Chrome، ثم اضغط القائمة ⋮ واختر «تثبيت التطبيق» أو «تثبيت وإنشاء اختصار».": "Open the app in Chrome, tap the ⋮ menu, then choose Install app or Install and create shortcut.",
    "تثبيت على Android": "Install on Android",
    "iPhone / iPad": "iPhone / iPad",
    "افتح الرابط في Safari، اضغط «مشاركة»، ثم «إضافة إلى الشاشة الرئيسية».": "Open the link in Safari, tap Share, then Add to Home Screen.",
    "أيقونة التطبيق وملفات التشغيل والـmanifest تُحمّل تلقائيًا من رابط التطبيق، ولا تحتاج لتنزيلها منفصلة.": "The app icon, runtime files, and manifest load automatically from the app link; you do not need to download them separately.",
    "فتح رابط التطبيق": "Open App Link",
    "بدأ تثبيت التطبيق. أكمل الخطوات التي تظهر على الشاشة.": "App installation started. Follow the steps shown on screen.",
    "أُضيف التطبيق إلى جهازك.": "The app was added to your device.",
    "للتثبيت، افتح الرابط في Chrome ثم القائمة ⋮ واختر تثبيت التطبيق.": "To install, open the link in Chrome, tap ⋮, then choose Install app.",
    "تم إلغاء التثبيت. يمكنك المحاولة من قائمة Chrome.": "Installation was dismissed. You can try again from the Chrome menu.",
    "العربية": "Arabic",
    "مظهر التطبيق": "Appearance",
    "اختيار المظهر": "Choose appearance",
    "ألوان التطبيق": "Color theme",
    "اختيار الألوان": "Choose colors",
    "تلقائي": "System",
    "فاتح": "Light",
    "داكن": "Dark",
    "أخضر هادئ": "Calm Green",
    "أزرق محيطي": "Ocean Blue",
    "بنفسجي ناعم": "Soft Lavender",
    "وردي هادئ": "Soft Rose",
    "رملي دافئ": "Warm Sand",
    "أنشئ حسابًا أو سجّل الدخول لحفظ الشعب والطلاب والدرجات في حسابك والوصول إليها من أجهزتك.": "Create an account or sign in to save your sections, students, and grades to your account and access them from your devices.",
    "البريد الإلكتروني": "Email address",
    "كلمة المرور": "Password",
    "إنشاء حساب": "Create Account",
    "تسجيل الدخول": "Sign In",
    "المتابعة باستخدام Google": "Continue with Google",
    "المتابعة باستخدام Apple": "Continue with Apple",
    "أو استخدم البريد الإلكتروني وكلمة المرور": "Or use email and password",
    "إرسال رابط إعادة تعيين كلمة المرور": "Send Password Reset Link",
    "البيانات محفوظة على هذا الجهاز فقط.": "Data is saved on this device only.",
    "جارٍ الاتصال بالحساب ومزامنة البيانات…": "Connecting to your account and syncing data…",
    "تم إنشاء الحساب. جارٍ نقل بيانات هذا الجهاز إلى حسابك…": "Account created. Uploading this device's data to your account…",
    "تم تسجيل الدخول. جارٍ تحميل بيانات الحساب…": "Signed in. Loading account data…",
    "تم تسجيل الدخول. جارٍ تحميل بيانات الحساب.": "Signed in. Loading account data.",
    "تم تسجيل الدخول. بيانات الجهاز محفوظة محليًا وستُزامن عند عودة الإنترنت.": "Signed in. Device data is saved locally and will sync when internet returns.",
    "تمت مزامنة البيانات مع الحساب.": "Data synced with your account.",
    "تم حفظ التغيير على هذا الجهاز، وسيُزامن عند عودة الإنترنت.": "Change saved on this device and will sync when internet returns.",
    "تعذر الاتصال بالحساب السحابي. بقيت بياناتك محفوظة على هذا الجهاز.": "Could not connect to the cloud account. Your data remains saved on this device.",
    "وجدنا بيانات محلية أقدم مختلفة؛ حُفظت نسخة منها قبل تحميل بيانات الحساب.": "Different local data was found. A copy was saved before loading account data.",
    "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك.": "A password reset link was sent to your email.",
    "الحساب غير جاهز بعد. اتبع خطوات إعداد Firebase أولًا.": "The account feature is not ready yet. Complete the Firebase setup first.",
    "أدخل بريدًا إلكترونيًا صحيحًا.": "Enter a valid email address.",
    "أدخل كلمة المرور.": "Enter your password.",
    "البريد الإلكتروني مستخدم بالفعل. سجّل الدخول بدلًا من إنشاء حساب جديد.": "This email is already registered. Sign in instead of creating another account.",
    "البريد الإلكتروني غير صحيح.": "The email address is invalid.",
    "كلمة المرور قصيرة؛ استخدم 6 أحرف على الأقل.": "Password is too short. Use at least 6 characters.",
    "البريد الإلكتروني أو كلمة المرور غير صحيحة.": "The email or password is incorrect.",
    "تعذر الوصول إلى قاعدة البيانات. تحقق من إعداد Firestore وقواعد الأمان.": "Could not access the database. Check Firestore setup and security rules.",
    "تعذر إكمال العملية. تحقق من إعداد الحساب والإنترنت ثم حاول مرة أخرى.": "Could not complete the operation. Check account setup and internet, then try again.",
    "جارٍ فتح نافذة تسجيل الدخول…": "Opening the sign-in window…",
    "أُغلقت نافذة تسجيل الدخول قبل اكتمال العملية.": "The sign-in window was closed before completion.",
    "حظر المتصفح نافذة تسجيل الدخول. اسمح بالنوافذ المنبثقة وحاول مرة أخرى.": "The browser blocked the sign-in window. Allow pop-ups and try again.",
    "تم تسجيل الخروج. بياناتك المحفوظة على هذا الجهاز لم تُحذف.": "Signed out. Data saved on this device was not deleted.",
    "التواصل عبر واتساب على الرقم 07815614400": "Contact us on WhatsApp at 07815614400",
    "التواصل عبر واتساب": "Contact us on WhatsApp",
    "تمت استعادة النسخة الاحتياطية بنجاح.": "Backup restored successfully.",
    "تعذر استعادة الملف. اختر نسخة احتياطية صادرة من هذا التطبيق.": "Could not restore the file. Choose a backup created by this app.",
    "تعذر قراءة الملف.": "Could not read the file.",
    "سيتم حذف جميع أسماء الطلاب ودرجاتهم في هذه الشعبة فقط. هل تريد المتابعة؟": "All student names and grades in this section will be deleted. Continue?",
    "ستُستبدل بيانات الطلاب والدرجات الحالية بجميع المراحل والفروع والصفوف والشعب الموجودة في النسخة الاحتياطية. هل تريد المتابعة؟": "Current student and grade data for all levels, branches, grades, and sections will be replaced with the backup. Continue?",
    "تعذر الاتصال بخدمة تحديث التطبيق.": "Could not connect to the app update service.",
    "جارٍ التحقق…": "Checking…",
    "جارٍ تنزيل التحديث. سيظهر تنبيه عند اكتماله.": "Downloading the update. You will be notified when it is ready.",
    "التطبيق محدّث إلى آخر نسخة متاحة.": "The app is up to date.",
    "تعذر التحقق الآن. تأكد من اتصال الإنترنت ثم أعد المحاولة.": "Could not check for updates. Check your internet connection and try again.",
    "الاسم الجديد": "New name",
    "book": "Notebook",
    "part": "Participation",
    "beh": "Conduct",
    "extra": "Activity",
    "e1": "Exam 1",
    "e2": "Exam 2",
    "e3": "Exam 3",
    "a1": "Month 1",
    "a2": "Month 2",
    "ad": "Daily grade",
    "s1": "Semester 1 grade",
    "half": "Midyear grade",
    "b1": "Month 1",
    "b2": "Month 2",
    "bd": "Daily grade",
    "s2": "Semester 2 grade",
    "year": "Annual grade",
    "fin": "Final exam"
  };
  var reverse = Object.create(null);
  Object.keys(translations).forEach(function (arabic) { reverse[translations[arabic]] = arabic; });
  var originals = new WeakMap();
  var applied = new WeakMap();
  var language = "ar";

  function translate(value) {
    var text = String(value == null ? "" : value);
    if (Object.prototype.hasOwnProperty.call(translations, text)) return translations[text];
    var match = /^(\d+ - )?الشعبة (\d+)(\s*▾)?$/.exec(text);
    if (match) return (match[1] || "") + "Section " + match[2] + (match[3] || "");
    match = /^الصف (الأول|الثاني|الثالث|الرابع|الخامس|السادس) (الابتدائي|المتوسط|الثانوي|الإعدادي)$/.exec(text);
    if (match) {
      var ordinals = { "الأول": "First", "الثاني": "Second", "الثالث": "Third", "الرابع": "Fourth", "الخامس": "Fifth", "السادس": "Sixth" };
      var levels = { "الابتدائي": "Primary", "المتوسط": "Intermediate", "الثانوي": "Secondary", "الإعدادي": "Preparatory" };
      return ordinals[match[1]] + " " + levels[match[2]] + " Grade";
    }
    match = /^تغيير اسم (.+)$/.exec(text);
    if (match) return "Rename " + translate(match[1]);
    match = /^الاسم الجديد للشعبة (\d+)$/.exec(text);
    if (match) return "New name for Section " + match[1];
    match = /^(.+) \(من (\d+)\)$/.exec(text);
    if (match && translations[match[1]]) return translations[match[1]] + " (max " + match[2] + ")";
    match = /^إصدار البرنامج (.+)$/.exec(text);
    if (match) return "App version " + match[1];
    return text;
  }
  function translateNode(node) {
    var current = node.nodeValue;
    if (applied.get(node) !== current) originals.set(node, reverse[current] || current);
    var base = originals.has(node) ? originals.get(node) : current;
    var result = language === "en" ? translate(base) : base;
    if (result !== current) node.nodeValue = result;
    applied.set(node, result);
  }
  function translateAttribute(element, name) {
    var key = name + "\u0000";
    var bag = element.__languageOriginals || (element.__languageOriginals = Object.create(null));
    var current = element.getAttribute(name);
    if (bag[key + "applied"] !== current) bag[key + "base"] = reverse[current] || current;
    var base = bag[key + "base"] == null ? current : bag[key + "base"];
    var result = language === "en" ? translate(base) : base;
    if (current !== result) element.setAttribute(name, result);
    bag[key + "applied"] = result;
  }
  function translateTree(root) {
    if (root.nodeType === 3) { translateNode(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    var elements = root.nodeType === 1 ? [root].concat(Array.from(root.querySelectorAll("*"))) : Array.from(root.querySelectorAll("*"));
    elements.forEach(function (element) {
      ["aria-label", "title", "placeholder", "alt"].forEach(function (name) { if (element.hasAttribute(name)) translateAttribute(element, name); });
      if (element.matches('meta[name="apple-mobile-web-app-title"]')) translateAttribute(element, "content");
    });
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) translateNode(node);
  }
  function setLanguage(next) {
    language = next === "en" ? "en" : "ar";
    document.documentElement.lang = language;
    document.documentElement.dir = language === "en" ? "ltr" : "rtl";
    var manifest = document.getElementById("app-manifest");
    if (manifest) manifest.href = language === "en" ? "manifest-en.webmanifest" : "manifest.webmanifest";
    document.querySelectorAll(".license-gate").forEach(function (gate) { gate.dir = document.documentElement.dir; });
    document.querySelectorAll(".update-banner").forEach(function (banner) { banner.dir = document.documentElement.dir; });
    document.querySelectorAll("[data-language-select]").forEach(function (select) { select.value = language; });
    translateTree(document.documentElement);
    document.querySelectorAll("[data-language-select]").forEach(function (select) { select.value = language; });
    try { localStorage.setItem(STORAGE_KEY, language); } catch (_) {}
  }

  var saved = "ar";
  try { saved = localStorage.getItem(STORAGE_KEY) || "ar"; } catch (_) {}
  setLanguage(saved);
  document.addEventListener("change", function (event) {
    var select = event.target.closest && event.target.closest("[data-language-select]");
    if (select) setLanguage(select.value);
  });
  var observer = new MutationObserver(function (records) {
    records.forEach(function (record) {
      if (record.type === "characterData") translateNode(record.target);
      else if (record.type === "attributes") translateAttribute(record.target, record.attributeName);
      else record.addedNodes.forEach(translateTree);
    });
  });
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["aria-label", "title", "placeholder", "alt", "content"] });
  ["alert", "confirm"].forEach(function (name) {
    var original = window[name];
    if (typeof original !== "function") return;
    window[name] = function (message) { return original.call(window, language === "en" ? translate(message) : message); };
  });
})();
