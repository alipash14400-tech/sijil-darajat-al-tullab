(function () {
  "use strict";

  var VIEW_KEY = "student-grades-app-view-v1";
  var main = document.getElementById("app-main");
  var topbar = main && main.querySelector(".app-topbar");
  if (!main || !topbar) return;

  var style = document.createElement("style");
  style.id = "planner-style-dashboard";
  style.textContent = `
    #app-main.dashboard-layout{max-width:none;margin:0 0 0 238px;padding:22px 24px 50px}
    #app-main.dashboard-layout .app-settings>summary{display:none}
    #grades-sidebar{position:fixed;z-index:1500;left:0;top:0;bottom:0;width:222px;padding:23px 14px;display:flex;flex-direction:column;background:color-mix(in srgb,#102c3a 88%,var(--accent));color:#edf5f4;direction:rtl;box-shadow:8px 0 28px rgba(15,35,45,.18)}
    .grades-brand{display:flex;align-items:center;gap:11px;padding:2px 9px 25px}.grades-brand-icon{display:grid;place-items:center;width:42px;height:42px;overflow:hidden;border:2px solid rgba(255,255,255,.8);border-radius:14px;background:#fff}.grades-brand-icon img{width:100%;height:100%;object-fit:cover}.grades-brand b{display:block;color:#fff;font-size:15px}.grades-brand small{color:#aabfc2;font-size:11px}.grades-nav-label{margin:0 11px 8px;color:#9fb4b8;font-size:10px;font-weight:700}.grades-nav{display:grid;gap:4px}.grades-nav button{display:flex;align-items:center;gap:11px;min-height:45px;padding:8px 11px;border:0;border-radius:11px;background:transparent;color:#d7e4e3;text-align:right;font:600 .9rem Cairo,Tahoma,sans-serif;cursor:pointer}.grades-nav button:hover{background:rgba(255,255,255,.08)}.grades-nav button.active{background:color-mix(in srgb,var(--accent) 35%,transparent);color:#fff;box-shadow:inset -3px 0 var(--accent)}.grades-nav .nav-icon{display:grid;place-items:center;width:25px;color:color-mix(in srgb,var(--accent) 70%,white);font-size:19px}.grades-nav .nav-icon .person-icon{width:24px;height:24px;border-radius:50%;object-fit:cover}.grades-side-note{margin-top:auto;padding:13px 11px;border-top:1px solid rgba(255,255,255,.13);color:#aabfc2;font-size:11px;line-height:1.7}.grades-side-note strong{display:block;color:#e9f2f1}
    .app-header-actions{display:flex;align-items:center;gap:10px}.app-date-chip{padding:7px 12px;border:1px solid var(--line);border-radius:999px;background:var(--surface);color:var(--muted);font-size:.82rem;white-space:nowrap}.app-user-avatar{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:var(--accent);color:var(--accent-ink);font-weight:800;box-shadow:0 4px 12px color-mix(in srgb,var(--accent) 20%,transparent)}
    .credits-image .wa-hotspot{left:35%;top:80%;width:30%;height:11%}
    #grade-dashboard{display:none}.dashboard-home #grade-dashboard{display:block}.dashboard-layout>.hint{display:none!important}.dashboard-home>.meta,.dashboard-home>.bar,.dashboard-home>.pane,.dashboard-home>.below-table-actions,.dashboard-home>.hint,.dashboard-home>.credits{display:none!important}
    .dashboard-home .app-topbar{margin-bottom:20px}.dashboard-welcome{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:16px;padding:25px 27px;border:1px solid color-mix(in srgb,var(--accent) 23%,var(--line));border-radius:20px;background:linear-gradient(125deg,color-mix(in srgb,var(--accent) 13%,var(--surface)),var(--surface) 75%);box-shadow:0 10px 30px rgba(18,44,56,.06)}.dashboard-eyebrow{margin-bottom:4px;color:var(--accent);font-size:.78rem;font-weight:800}.dashboard-welcome h2{margin:0 0 6px;font-size:1.6rem}.dashboard-welcome p{margin:0;color:var(--muted)}.dashboard-class-pill{flex:0 0 auto;padding:10px 14px;border:1px solid color-mix(in srgb,var(--accent) 22%,var(--line));border-radius:13px;background:var(--surface);color:var(--accent);font-size:.85rem;font-weight:700}
    .dashboard-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px;margin-bottom:16px}.dashboard-stat{min-height:126px;padding:17px;border:1px solid var(--line);border-radius:16px;background:var(--surface);box-shadow:0 7px 24px rgba(18,44,56,.045)}.dashboard-stat-top{display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--muted);font-size:.83rem;font-weight:700}.dashboard-stat-icon{display:grid;place-items:center;width:34px;height:34px;border-radius:11px;background:color-mix(in srgb,var(--accent) 12%,var(--surface));color:var(--accent);font-size:18px}.dashboard-stat strong{display:block;margin-top:8px;color:var(--ink);font-size:1.75rem;line-height:1.1}.dashboard-stat small{display:block;margin-top:5px;color:var(--muted);font-size:.72rem}
    .dashboard-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr);gap:15px}.dashboard-card{min-width:0;padding:17px;border:1px solid var(--line);border-radius:17px;background:var(--surface);box-shadow:0 7px 24px rgba(18,44,56,.045)}.dashboard-card-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}.dashboard-card-head h3{margin:0;font-size:1rem}.dashboard-link{border:0;background:transparent;color:var(--accent);font:700 .8rem Cairo,Tahoma,sans-serif;cursor:pointer}.dashboard-roster{width:100%;min-width:0;max-width:100%;table-layout:fixed;border-collapse:collapse}.dashboard-roster td,.dashboard-roster th{min-width:0;padding:9px 7px;border-bottom:1px solid var(--line);text-align:right;overflow-wrap:anywhere}.dashboard-roster th{color:var(--muted);font-size:.75rem}.dashboard-roster tr:last-child td{border-bottom:0}.dashboard-empty{padding:22px 8px;color:var(--muted);text-align:center;font-size:.88rem}.dashboard-quick-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.dashboard-quick{display:flex;align-items:center;gap:10px;min-height:58px;padding:9px 10px;border:1px solid var(--line);border-radius:12px;background:var(--surface);color:var(--ink);text-align:right;font:700 .8rem Cairo,Tahoma,sans-serif;cursor:pointer}.dashboard-quick:hover{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 5%,var(--surface))}.dashboard-quick i{display:grid;place-items:center;flex:0 0 34px;height:34px;border-radius:10px;background:color-mix(in srgb,var(--accent) 12%,var(--surface));color:var(--accent);font-size:18px;font-style:normal}.dashboard-profile{margin-top:13px;padding:12px;border-radius:12px;background:color-mix(in srgb,var(--accent) 6%,var(--surface));color:var(--muted);font-size:.82rem;line-height:1.9}.dashboard-profile strong{color:var(--ink)}
    @media(max-width:1050px){#app-main.dashboard-layout{margin-left:205px;padding-inline:18px}.dashboard-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.dashboard-grid{grid-template-columns:1fr}}
    @media(max-width:760px){#app-main.dashboard-layout{margin:0;padding:12px 12px 105px}.app-topbar{min-height:72px;padding:10px 12px}.app-topbar h1{font-size:1.08rem}.app-topbar h1::before{flex-basis:38px;width:38px;height:38px}.app-header-actions{gap:6px}.app-date-chip{display:none}.app-user-avatar{width:34px;height:34px}.app-settings summary{font-size:.83rem;padding:6px 8px}#grades-sidebar{top:auto;right:0;left:0;bottom:0;width:auto;height:auto;min-height:0;padding:6px 6px calc(6px + env(safe-area-inset-bottom));border-radius:17px 17px 0 0;box-shadow:0 -8px 25px rgba(12,37,45,.15)}.grades-brand,.grades-nav-label,.grades-side-note{display:none}.grades-nav{display:flex;justify-content:space-around;gap:2px}.grades-nav button{flex:1;min-width:0;min-height:56px;flex-direction:column;justify-content:center;gap:2px;padding:4px 1px;border-radius:9px;font-size:.62rem;line-height:1.2}.grades-nav .nav-icon{width:auto;font-size:18px}.grades-nav button.active{box-shadow:inset 0 -2px var(--accent)}.dashboard-welcome{align-items:flex-start;flex-direction:column;padding:19px;border-radius:16px}.dashboard-welcome h2{font-size:1.3rem}.dashboard-class-pill{padding:7px 10px;font-size:.76rem}.dashboard-stats{gap:8px}.dashboard-stat{min-height:106px;padding:12px;border-radius:14px}.dashboard-stat strong{font-size:1.55rem}.dashboard-stat-top{font-size:.72rem}.dashboard-grid{gap:10px}.dashboard-card{padding:13px;border-radius:14px}.dashboard-quick{min-height:55px;font-size:.72rem}.dashboard-home .app-topbar{margin-bottom:14px}}
    @media(max-width:760px){#app-main.dashboard-layout{width:100%;max-width:100%;min-width:0;box-sizing:border-box}.dashboard-home .dashboard-roster{width:100%;min-width:0;max-width:100%;table-layout:fixed}.dashboard-home .dashboard-roster th,.dashboard-home .dashboard-roster td{overflow-wrap:anywhere}}
    @media(max-width:760px){.app-settings[open] .settings-menu{top:calc(env(safe-area-inset-top,0px) + 72px);bottom:calc(78px + env(safe-area-inset-bottom,0px));max-height:none;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding-bottom:18px}}
    @media(max-width:760px){#grades-sidebar{box-sizing:border-box;padding-left:calc(6px + env(safe-area-inset-left,0px));padding-right:calc(6px + env(safe-area-inset-right,0px))}}
    @media(max-width:760px) and (orientation:landscape) and (max-height:520px){#app-main.dashboard-layout{padding-bottom:84px}#grades-sidebar{padding-top:3px;padding-bottom:calc(3px + env(safe-area-inset-bottom,0px));border-radius:12px 12px 0 0}.grades-nav{gap:1px}.grades-nav button{min-height:44px;gap:0;padding:2px 1px;font-size:.57rem;line-height:1.05}.grades-nav .nav-icon{font-size:15px}}
    @media(max-width:380px){.grades-nav button{font-size:.56rem}.dashboard-stat{padding:10px}.dashboard-stat-top{font-size:.68rem}.dashboard-quick-grid{gap:7px}}
    @media (orientation:landscape) and (max-height:600px) and (max-width:1024px){#app-main.dashboard-layout{margin:0;padding:8px 12px 66px}.app-topbar{min-height:56px;padding:6px 12px;margin-bottom:10px}.app-topbar h1{font-size:1rem}#grades-sidebar{box-sizing:border-box;top:auto;right:0;bottom:0;left:0;width:100%;height:auto;min-height:0;padding:3px 8px calc(3px + env(safe-area-inset-bottom));border-radius:12px 12px 0 0}.grades-brand,.grades-nav-label,.grades-side-note{display:none}.grades-nav{display:flex;justify-content:space-around;gap:3px}.grades-nav button{display:flex;flex:1;min-width:0;min-height:44px;flex-direction:row;justify-content:center;gap:5px;padding:3px 4px;border-radius:8px;font-size:.68rem;line-height:1.1;white-space:nowrap}.grades-nav .nav-icon{width:auto;font-size:16px}.dashboard-home .app-topbar{margin-bottom:10px}.dashboard-welcome{flex-direction:row;align-items:center;gap:12px;margin-bottom:9px;padding:12px 15px}.dashboard-welcome h2{font-size:1.15rem}.dashboard-stats{grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:9px}.dashboard-stat{min-height:82px;padding:9px}.dashboard-stat strong{font-size:1.3rem}.dashboard-grid{grid-template-columns:minmax(0,1.2fr) minmax(240px,.8fr);gap:9px}.dashboard-card{padding:10px}.dashboard-quick-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.dashboard-quick{min-height:42px;padding:6px;font-size:.72rem}.meta{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));align-items:start;gap:6px;padding:7px;margin-bottom:8px}.meta>label,.meta>.section-picker,.meta>.school-year-group{min-width:0;padding:5px}.meta label{gap:3px;font-size:.76rem}.meta input,.meta select{min-height:34px;padding:4px 7px;font-size:.82rem}.meta .school-year-group{grid-column:span 4}.school-year-fields{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.bar{display:grid;grid-template-columns:minmax(250px,1.3fr) minmax(150px,.8fr) auto;gap:7px;padding:8px;margin-bottom:8px}.tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));min-width:0;gap:4px}.tab{min-width:0;min-height:42px;padding:5px;font-size:.75rem}.search-label{min-width:0}.search-label input{width:100%;min-width:0}.bar>div:not(.tabs){display:flex;gap:5px}.bar .btn{min-height:40px;padding:5px 8px;font-size:.75rem}.wrap{max-width:100%;overflow-x:auto;overscroll-behavior-x:contain}.below-table-actions{grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.below-table-actions .btn{min-width:0;padding:6px;font-size:.72rem}.app-settings[open] .settings-menu{position:fixed;z-index:2200;top:calc(env(safe-area-inset-top,0px) + 60px);right:max(10px,env(safe-area-inset-right,0px));bottom:calc(56px + env(safe-area-inset-bottom,0px));left:auto;width:min(560px,calc(100vw - 20px));max-height:none;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}}
    @media(prefers-reduced-motion:reduce){.dashboard-quick,.grades-nav button{transition:none}}
  `;
  document.head.appendChild(style);
  var navLayoutStyle = document.createElement("style");
  navLayoutStyle.textContent = `
    @media(max-width:760px){#grades-sidebar{transition:transform .28s ease,opacity .2s ease;will-change:transform}#grades-sidebar.nav-idle-hidden{transform:translateY(calc(100% + env(safe-area-inset-bottom,0px)));opacity:0;pointer-events:none}}
    @media(max-width:760px) and (prefers-reduced-motion:reduce){#grades-sidebar{transition:none}}
    @media(max-width:760px){.grades-nav button{flex-direction:column!important;align-items:center;justify-content:center;gap:3px;min-height:58px;white-space:normal;text-align:center}.grades-nav button>.nav-icon{order:0;display:grid;place-items:center;width:auto;height:21px;margin:0;font-size:18px}.grades-nav button>span:last-child{order:1;display:block;width:100%;font-size:.59rem;line-height:1.05;text-align:center}}
    @media(max-width:760px) and (orientation:landscape) and (max-height:600px){.grades-nav button{flex-direction:column!important;min-height:50px;gap:1px;padding:2px 1px;white-space:normal}.grades-nav button>.nav-icon{height:18px;font-size:15px}.grades-nav button>span:last-child{font-size:.57rem;line-height:1.02}}
  `;
  document.head.appendChild(navLayoutStyle);
  var classPickerStyle = document.createElement("style");
  classPickerStyle.textContent = `.dashboard-class-pill{font:inherit;text-align:right;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease}.dashboard-class-pill:hover{box-shadow:0 5px 16px color-mix(in srgb,var(--accent) 18%,transparent);transform:translateY(-1px)}.dashboard-class-pill:focus-visible{outline:3px solid color-mix(in srgb,var(--accent) 45%,transparent);outline-offset:2px}.class-picker-modal[hidden]{display:none!important}.class-picker-modal{position:fixed;inset:0;z-index:23000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(5,20,24,.64)}.class-picker-card{width:min(100%,460px);max-height:min(90dvh,700px);overflow:auto;padding:20px;border:1px solid var(--line);border-radius:18px;background:var(--surface);color:var(--ink);box-shadow:0 16px 48px rgba(0,0,0,.28)}.class-picker-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.class-picker-head h2{margin:0;font-size:1.1rem}.class-picker-close{width:40px;height:40px;border:1px solid var(--line);border-radius:12px;background:var(--surface);color:var(--ink);font-size:1.2rem;cursor:pointer}.class-picker-fields{display:grid;gap:11px}.class-picker-fields label{display:grid;gap:5px;color:var(--muted);font-size:.84rem;font-weight:700}.class-picker-fields select{width:100%;min-height:46px;padding:8px 10px;border:1px solid var(--line);border-radius:11px;background:var(--surface);color:var(--ink);font:inherit}.class-picker-fields select:focus-visible{outline:3px solid color-mix(in srgb,var(--accent) 35%,transparent);outline-offset:1px}`;
  document.head.appendChild(classPickerStyle);

  var roleImage = "male";
  try {
    var onboardingProfile = JSON.parse(localStorage.getItem("student-grades-onboarding-v2") || "null");
    if (onboardingProfile && (onboardingProfile.role === "teacheress" || onboardingProfile.role === "instructress")) roleImage = "female";
  } catch (_) {}
  var personIconMarkup = '<img class="person-icon" src="./person-' + roleImage + '.png" alt="" aria-hidden="true">';
  var nav = document.createElement("aside");
  nav.id = "grades-sidebar";
  nav.setAttribute("aria-label", "القائمة الرئيسية");
  nav.innerHTML = '<div class="grades-brand"><span class="grades-brand-icon"><img src="app-icon-192.png" alt=""></span><span><b>سجل الدرجات</b><small>دفتر المدرس</small></span></div><p class="grades-nav-label">القائمة الرئيسية</p><nav class="grades-nav"><button type="button" data-app-view="home"><span class="nav-icon">⌂</span><span>الرئيسية</span></button><button type="button" data-app-view="daily"><span class="nav-icon">▤</span><span>يومي الأول</span></button><button type="button" data-app-view="daily2"><span class="nav-icon">▥</span><span>يومي الثاني</span></button><button type="button" data-app-view="monthly"><span class="nav-icon">▦</span><span>الدرجات الشهرية</span></button><button type="button" data-app-view="students"><span class="nav-icon">' + personIconMarkup + '</span><span>الطلبة</span></button><button type="button" data-app-view="distribution"><span class="nav-icon">％</span><span>توزيع الدرجات</span></button><button type="button" data-app-view="settings"><span class="nav-icon">⚙</span><span>الإعدادات</span></button></nav><div class="grades-side-note"><strong>دفترك محفوظ تلقائيًا</strong>يمكنك حفظ نسخة احتياطية من أدوات السجل.</div>';
  main.classList.add("dashboard-layout");
  main.insertBefore(nav, topbar);
  var navIdleTimer = 0;
  function showBottomNav() {
    if (window.innerWidth > 760) { nav.classList.remove("nav-idle-hidden"); window.clearTimeout(navIdleTimer); return; }
    nav.classList.remove("nav-idle-hidden");
    window.clearTimeout(navIdleTimer);
    navIdleTimer = window.setTimeout(function () { if (window.innerWidth <= 760 && !document.hidden) nav.classList.add("nav-idle-hidden"); }, 15000);
  }
  ["pointerdown", "pointermove", "touchstart", "keydown", "wheel", "scroll"].forEach(function (type) {
    window.addEventListener(type, showBottomNav, { passive: type !== "keydown", capture: true });
  });
  document.addEventListener("visibilitychange", function () { if (!document.hidden) showBottomNav(); });
  window.addEventListener("resize", showBottomNav, { passive: true });
  showBottomNav();

  var headerActions = document.createElement("div");
  headerActions.className = "app-header-actions";
  var dateChip = document.createElement("span");
  dateChip.className = "app-date-chip";
  try { dateChip.textContent = new Intl.DateTimeFormat("ar-IQ-u-nu-latn", { weekday: "long", day: "numeric", month: "long" }).format(new Date()); }
  catch (_) { dateChip.textContent = new Date().toLocaleDateString(); }
  var avatar = document.createElement("span");
  avatar.className = "app-user-avatar";
  avatar.setAttribute("aria-label", "المدرس/ة");
  var settings = topbar.querySelector(".app-settings");
  headerActions.append(dateChip, avatar);
  if (settings) headerActions.appendChild(settings);
  topbar.appendChild(headerActions);

  var dashboard = document.createElement("section");
  dashboard.id = "grade-dashboard";
  topbar.after(dashboard);
  var classPicker = document.createElement("div");
  classPicker.className = "class-picker-modal";
  classPicker.hidden = true;
  classPicker.setAttribute("role", "dialog");
  classPicker.setAttribute("aria-modal", "true");
  classPicker.setAttribute("aria-labelledby", "class-picker-title");
  classPicker.innerHTML = '<div class="class-picker-card"><header class="class-picker-head"><h2 id="class-picker-title">اختيار الصف والشعبة</h2><button type="button" class="class-picker-close" aria-label="إغلاق">×</button></header><div class="class-picker-fields"><label>المرحلة الدراسية<select data-class-picker="stage"></select></label><label data-class-picker-branch-row>الفرع<select data-class-picker="branch"></select></label><label>الصف الدراسي<select data-class-picker="grade"></select></label><label>الشعبة<select data-class-picker="section"></select></label></div></div>';
  document.body.appendChild(classPicker);
  var classPickerFields = { stage: classPicker.querySelector('[data-class-picker="stage"]'), branch: classPicker.querySelector('[data-class-picker="branch"]'), grade: classPicker.querySelector('[data-class-picker="grade"]'), section: classPicker.querySelector('[data-class-picker="section"]') };
  function copySelectOptions(source, target) {
    if (!source || !target) return;
    target.replaceChildren.apply(target, Array.prototype.map.call(source.options, function (option) { var clone = option.cloneNode(true); clone.selected = option.selected; return clone; }));
    target.value = source.value;
  }
  function syncClassPicker() {
    var sources = { stage: document.getElementById("stage-select"), branch: document.getElementById("branch-select"), grade: document.getElementById("grade-select"), section: document.getElementById("section-select") };
    Object.keys(sources).forEach(function (key) { copySelectOptions(sources[key], classPickerFields[key]); });
    var branchLabel = document.getElementById("branch-label");
    classPicker.querySelector("[data-class-picker-branch-row]").hidden = !branchLabel || branchLabel.hidden;
  }
  function changeClassSelection(key) {
    var source = document.getElementById(({ stage: "stage-select", branch: "branch-select", grade: "grade-select", section: "section-select" })[key]);
    var chosen = classPickerFields[key];
    if (!source || !chosen) return;
    source.value = chosen.value;
    source.dispatchEvent(new Event("change", { bubbles: true }));
    syncClassPicker();
    if (main.classList.contains("dashboard-home")) renderHome();
  }
  Object.keys(classPickerFields).forEach(function (key) { classPickerFields[key].addEventListener("change", function () { changeClassSelection(key); }); });
  function closeClassPicker() { classPicker.hidden = true; }
  function openClassPicker() { syncClassPicker(); classPicker.hidden = false; classPickerFields.stage.focus(); }
  classPicker.querySelector(".class-picker-close").addEventListener("click", closeClassPicker);
  classPicker.addEventListener("click", function (event) { if (event.target === classPicker) closeClassPicker(); });
  classPicker.addEventListener("keydown", function (event) { if (event.key === "Escape") closeClassPicker(); });
  var settingsStyle = document.createElement("style");
  settingsStyle.textContent = `
    .grades-settings-page{max-width:960px;margin:0 auto;padding:4px 0 32px;color:var(--ink)}
    .grades-settings-page[hidden]{display:none!important}
    .grades-settings-breadcrumb{margin:0 4px 18px;color:var(--muted);font-size:.84rem}
    .grades-settings-heading{margin:0 4px 18px}.grades-settings-heading small{color:var(--accent);font-weight:700}.grades-settings-heading h2{margin:4px 0;font-size:1.55rem}.grades-settings-heading p{margin:0;color:var(--muted);font-size:.9rem}
    .grades-settings-card{margin:0 0 14px;padding:20px;border:1px solid var(--line);border-radius:18px;background:var(--surface);box-shadow:0 7px 24px rgba(18,44,56,.045)}
    .grades-settings-card h3{margin:0 0 14px;font-size:1.02rem}.grades-settings-profile .meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:0;padding:0;border:0;background:transparent;box-shadow:none}.grades-settings-profile .meta>label,.grades-settings-profile .meta>.section-picker,.grades-settings-profile .meta>.school-year-group{min-width:0;padding:9px;border:1px solid var(--line);border-radius:12px;background:var(--surface)}.grades-settings-profile .meta .school-year-group{grid-column:1/-1}.welcome-profile-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:0 0 13px}.welcome-profile-item{min-width:0;padding:10px;border:1px solid var(--line);border-radius:11px;background:color-mix(in srgb,var(--accent) 4%,var(--surface))}.welcome-profile-item span{display:block;margin-bottom:3px;color:var(--muted);font-size:.73rem}.welcome-profile-item strong{display:block;overflow-wrap:anywhere;color:var(--ink);font-size:.87rem}.welcome-profile-empty{color:var(--muted);font-size:.87rem}.welcome-profile-edit{width:100%;min-height:46px}
    .grades-settings-card .language-select-wrap,.grades-settings-card .appearance-select-wrap{padding:10px 0;border-bottom:1px solid var(--line)}.grades-settings-card .language-select-wrap:last-child,.grades-settings-card .appearance-select-wrap:last-child{border-bottom:0}
    .grades-settings-card .install-app-section{margin:0;padding:0;border:0;background:transparent}.grades-settings-card .install-app-section h3{display:none}.grades-settings-card .account-strip{display:grid;grid-template-columns:1fr;align-items:stretch;margin:0;padding:0;border:0;background:transparent}.grades-settings-card .account-strip>div{display:flex;flex-wrap:wrap}.grades-settings-card .below-table-actions{display:flex;justify-content:flex-start;margin:0}.grades-settings-card .settings-version{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}.grades-settings-card .settings-version .app-version{margin:0;padding:7px 12px;border-radius:999px;background:color-mix(in srgb,var(--accent) 12%,var(--surface));color:var(--accent);font-weight:700}
    .grades-settings-card .credits{margin:0}.grades-settings-card .credits-image{max-width:700px}.grades-settings-card .settings-actions{display:grid;gap:9px}.grades-settings-card .settings-actions .btn{width:100%;min-height:46px}.grades-settings-card #clear{border-color:color-mix(in srgb,#dc5b5b 28%,var(--line));color:#c83e3e;background:color-mix(in srgb,#dc5b5b 7%,var(--surface))}.grades-settings-grading>p{margin:0 0 12px;color:var(--muted);font-size:.86rem;line-height:1.7}.grades-settings-grading>[data-open-distribution]{width:100%;min-height:46px}
    .support-contact-intro{margin:-4px 0 14px;color:var(--muted);font-size:.88rem;line-height:1.7}.support-contact-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.support-contact{display:grid;grid-template-columns:42px minmax(0,1fr);align-items:center;gap:10px;min-width:0;min-height:68px;padding:10px 12px;border:1px solid var(--line);border-radius:13px;background:color-mix(in srgb,var(--accent) 4%,var(--surface));color:var(--ink);text-decoration:none;transition:border-color .18s ease,background .18s ease,transform .18s ease}.support-contact:hover,.support-contact:focus-visible{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 10%,var(--surface));transform:translateY(-1px);outline:none}.support-contact-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:color-mix(in srgb,var(--accent) 14%,var(--surface));color:var(--accent);font-size:1.2rem}.support-contact-copy{display:grid;gap:2px;min-width:0}.support-contact-copy strong{font-size:.83rem}.support-contact-copy small{overflow-wrap:anywhere;word-break:break-word;color:var(--muted);font-size:.73rem;line-height:1.45;direction:ltr;text-align:right}
    .dashboard-layout.settings-view #grades-settings-page{display:block}.dashboard-layout.settings-view #grade-dashboard,.dashboard-layout.settings-view>.meta,.dashboard-layout.settings-view>.bar,.dashboard-layout.settings-view>.pane,.dashboard-layout.settings-view>.below-table-actions,.dashboard-layout.settings-view>.hint,.dashboard-layout.settings-view>.credits{display:none!important}.dashboard-layout.settings-view .app-settings{display:none}
    .grades-distribution-page{max-width:900px;margin:0 auto;padding:4px 0 32px;color:var(--ink)}.grades-distribution-page[hidden]{display:none!important}.grades-distribution-heading{margin:0 4px 16px}.grades-distribution-heading small{color:var(--accent);font-weight:700}.grades-distribution-heading h2{margin:4px 0;font-size:1.45rem}.grades-distribution-heading p{margin:0;color:var(--muted);font-size:.9rem}.grades-distribution-card{padding:18px;border:1px solid var(--line);border-radius:18px;background:var(--surface);box-shadow:0 7px 24px rgba(18,44,56,.045)}.dashboard-layout.distribution-view #grades-distribution-page{display:block}.dashboard-layout.distribution-view #grade-dashboard,.dashboard-layout.distribution-view #grades-settings-page,.dashboard-layout.distribution-view>.meta,.dashboard-layout.distribution-view>.bar,.dashboard-layout.distribution-view>.pane,.dashboard-layout.distribution-view>.below-table-actions,.dashboard-layout.distribution-view>.hint,.dashboard-layout.distribution-view>.credits{display:none!important}.dashboard-layout.distribution-view .app-settings{display:none}
    @media(max-width:760px){.grades-settings-page,.grades-distribution-page{padding:0 2px 20px}.grades-settings-heading,.grades-distribution-heading{margin:0 5px 14px}.grades-settings-heading h2,.grades-distribution-heading h2{font-size:1.3rem}.grades-settings-card,.grades-distribution-card{padding:16px;margin-bottom:11px;border-radius:16px}.grades-settings-profile .meta{grid-template-columns:minmax(0,1fr);gap:9px}.grades-settings-profile .meta .school-year-group{grid-column:auto}.grades-settings-card .settings-actions .btn{min-height:48px}.welcome-profile-summary{grid-template-columns:minmax(0,1fr)}}
  `;
  document.head.appendChild(settingsStyle);
  var settingsPage = document.createElement("section");
  settingsPage.id = "grades-settings-page";
  settingsPage.className = "grades-settings-page";
  settingsPage.hidden = true;
  settingsPage.innerHTML = '<div class="grades-settings-breadcrumb">الرئيسية / الإعدادات</div><header class="grades-settings-heading"><small>تخصيص البرنامج</small><h2>الإعدادات وبيانات المدرسة</h2><p>حدّث بيانات السجل والمظهر والحفظ من مكان واحد.</p></header><section class="grades-settings-card grades-settings-profile"><h3>بيانات المدرس والمدرسة</h3></section><section class="grades-settings-card welcome-profile-card"><h3>بيانات الترحيب</h3><div class="welcome-profile-summary" id="welcome-profile-summary"></div><button type="button" class="btn primary welcome-profile-edit" id="edit-welcome-profile">تعديل بيانات الترحيب</button></section><section class="grades-settings-card grades-settings-appearance"><h3>المظهر والألوان</h3></section><section class="grades-settings-card grades-settings-grading"><h3>توزيع الدرجات</h3><p>افتح لوحة التوزيع التفاعلية لتعديل أسماء الخانات وعددها ودرجاتها.</p><button type="button" class="btn primary" data-open-distribution>فتح توزيع الدرجات</button></section><section class="grades-settings-card grades-settings-account"><h3>تسجيل الدخول والحفظ السحابي</h3></section><section class="grades-settings-card grades-settings-version-card"><h3>الإصدار والتحديث</h3><div class="settings-version"></div></section><section class="grades-settings-card grades-settings-install"><h3>تثبيت التطبيق على iPhone و Android</h3></section><section class="grades-settings-card grades-settings-backup"><h3>النسخ الاحتياطي وإدارة البيانات</h3><div class="settings-actions"></div></section><section class="grades-settings-card grades-settings-about"><h3>حول التطبيق</h3></section><section class="grades-settings-card grades-settings-support"><h3>الدعم الفني</h3></section>';
  dashboard.after(settingsPage);
  var distributionPage = document.createElement("section");
  distributionPage.id = "grades-distribution-page";
  distributionPage.className = "grades-distribution-page";
  distributionPage.hidden = true;
  distributionPage.innerHTML = '<div class="grades-settings-breadcrumb">الرئيسية / توزيع الدرجات</div><header class="grades-distribution-heading"><small>تخصيص الدرجات</small><h2>توزيع الدرجات اليومية والشهرية</h2><p>خصص خانات الدرجات اليومية والشهرية وأسماءها وعددها وتوزيعها.</p></header><section class="grades-distribution-card" id="grades-distribution-content"></section>';
  settingsPage.after(distributionPage);
  var settingsProfile = settingsPage.querySelector(".grades-settings-profile");
  var metaForm = main.querySelector(".meta");
  if (metaForm) settingsProfile.appendChild(metaForm);
  var saveButton = document.getElementById("save-now");
  if (saveButton) settingsProfile.appendChild(saveButton);
  var settingsMenu = settings && settings.querySelector(".settings-menu");
  if (settingsMenu) {
    var appearanceCard = settingsPage.querySelector(".grades-settings-appearance");
    ["[data-language-select]", "[data-theme-mode]", "[data-theme-palette]"].forEach(function (selector) { var control = settingsMenu.querySelector(selector); if (control) appearanceCard.appendChild(control.closest("label")); });
    var gradingSettings = settingsMenu.querySelector("#daily-grading-settings");
    if (gradingSettings) distributionPage.querySelector("#grades-distribution-content").appendChild(gradingSettings);
    var accountStrip = settingsMenu.querySelector(".account-strip");
    var lockSettings = settingsMenu.querySelector("#app-lock-settings");
    if (accountStrip) settingsPage.querySelector(".grades-settings-account").appendChild(accountStrip);
    if (lockSettings) settingsPage.querySelector(".grades-settings-account").appendChild(lockSettings);
    var installSection = settingsMenu.querySelector(".install-app-section:not(.app-support-section)");
    if (installSection) settingsPage.querySelector(".grades-settings-install").appendChild(installSection);
    var supportSection = settingsMenu.querySelector(".app-support-section");
    if (supportSection) settingsPage.querySelector(".grades-settings-support").appendChild(supportSection);
    var supportCard = settingsPage.querySelector(".grades-settings-support");
    if (supportCard) supportCard.innerHTML = '<h3>الدعم الفني والتواصل</h3><p class="support-contact-intro">اختر وسيلة التواصل المناسبة، وستفتح لك مباشرة.</p><div class="support-contact-grid"><a class="support-contact" href="mailto:tatbiqati.iq@gmail.com"><span class="support-contact-icon" aria-hidden="true">✉</span><span class="support-contact-copy"><strong>البريد الإلكتروني</strong><small>tatbiqati.iq@gmail.com</small></span></a><a class="support-contact" href="https://wa.me/9647815614400" target="_blank" rel="noopener noreferrer"><span class="support-contact-icon" aria-hidden="true">☏</span><span class="support-contact-copy"><strong>واتساب</strong><small>07815614400</small></span></a><a class="support-contact" href="https://t.me/tatbiqati_iq" target="_blank" rel="noopener noreferrer"><span class="support-contact-icon" aria-hidden="true">➤</span><span class="support-contact-copy"><strong>تليجرام</strong><small>t.me/tatbiqati_iq</small></span></a><a class="support-contact" href="https://tatbiqati-grades.web.app/" target="_blank" rel="noopener noreferrer"><span class="support-contact-icon" aria-hidden="true">⌂</span><span class="support-contact-copy"><strong>موقع تطبيقاتي</strong><small>tatbiqati-grades.web.app</small></span></a></div>';
    settingsMenu.remove();
  }
  var versionLabel = main.querySelector(".app-version");
  var updateButton = document.getElementById("check-update");
  var versionPanel = settingsPage.querySelector(".settings-version");
  if (versionLabel) versionPanel.appendChild(versionLabel);
  if (updateButton) versionPanel.appendChild(updateButton);
  var backupActions = settingsPage.querySelector(".settings-actions");
  ["backup-download", "backup-restore", "clear"].forEach(function (id) { var control = document.getElementById(id); if (control) backupActions.appendChild(control); });
  var aboutCard = settingsPage.querySelector(".grades-settings-about");
  var credits = main.querySelector(".credits");
  if (credits) aboutCard.appendChild(credits);
  var programmaticTabChange = false;

  function renderWelcomeProfile() {
    var profile = window.SijilOnboarding && window.SijilOnboarding.getProfile ? window.SijilOnboarding.getProfile() : {};
    var roleNames = { teacher: "معلم", teacheress: "معلمة", instructor: "مدرس", instructress: "مدرسة" };
    var principalNames = { principal: "مدير المدرسة", principaless: "مديرة المدرسة" };
    var stage = document.getElementById("stage-select"), grade = document.getElementById("grade-select"), directorate = document.getElementById("directorate-select");
    var values = [
      ["الصفة", roleNames[profile.role] || "—"],
      ["الاسم", profile.name || document.getElementById("m-teacher").value || "—"],
      ["المدرسة", profile.school || document.getElementById("m-school").value || "—"],
      ["نوع المدرسة", profile.schoolGender === "girls" ? "مدرسة بنات" : profile.schoolGender === "boys" ? "مدرسة بنين" : "—"],
      [principalNames[profile.principalRole] || "اسم المدير/ة", profile.principal || document.getElementById("m-principal").value || "—"],
      ["المادة", profile.subject || document.getElementById("m-subject").value || "—"],
      ["المرحلة والصف", stage && stage.options[stage.selectedIndex] ? stage.options[stage.selectedIndex].text.replace("الدراسة ", "") + (grade && grade.options[grade.selectedIndex] ? " · " + grade.options[grade.selectedIndex].text : "") : "—"],
      ["الشعبة", (document.getElementById("section-picker-toggle").textContent || "—").replace(/[▾⌄▼]/g, "").trim()],
      ["مديرية التربية", document.getElementById("m-directorate").value || (directorate && directorate.value !== "__other" ? directorate.options[directorate.selectedIndex].text : "") || profile.directorate || "—"]
    ];
    var summary = settingsPage.querySelector("#welcome-profile-summary");
    summary.replaceChildren();
    if (!profile.name && !profile.school) {
      var empty = document.createElement("p"); empty.className = "welcome-profile-empty"; empty.textContent = "أكمل بيانات الترحيب لتخصيص سجلاتك."; summary.appendChild(empty);
    }
    values.forEach(function (item) {
      var card = document.createElement("div"); card.className = "welcome-profile-item";
      var label = document.createElement("span"); label.textContent = item[0];
      var value = document.createElement("strong"); value.textContent = item[1];
      card.append(label, value); summary.appendChild(card);
    });
  }
  settingsPage.querySelector("#edit-welcome-profile").addEventListener("click", function () { if (window.SijilOnboarding && window.SijilOnboarding.openEditor) window.SijilOnboarding.openEditor(); });
  window.addEventListener("sijil-profile-updated", function () { renderWelcomeProfile(); if (main.classList.contains("dashboard-home")) renderHome(); });

  function escape(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]; });
  }
  function activeGradeIndex(book) {
    var stage = Number(book.activeStage) || 0, grade = Number(book.activeGrade) || 0, branch = Number(book.activeBranch) || 0;
    if (stage === 2) return 9 + grade + (grade >= 3 ? branch * 6 : 0);
    if (stage === 3) return 21 + grade + branch * 3;
    return stage === 1 ? 6 + grade : grade;
  }
  function hasGrade(student) {
    return ["d", "d2", "m"].some(function (group) { return Object.values(student && student[group] || {}).some(function (value) { return value != null && String(value).trim() !== ""; }); });
  }
  function getSummary(book) {
    var students = 0, sections = 0, grades = 0, activeSections = book.grades[activeGradeIndex(book)] && book.grades[activeGradeIndex(book)].sections || [], currentIndex = Number(book.activeSection) || 0, current = activeSections[currentIndex] || { students: [] };
    (book.grades || []).forEach(function (grade) { (grade.sections || []).forEach(function (section) {
      var used = false;
      (section.students || []).forEach(function (student) {
        var named = String(student && student.name || "").trim() !== "";
        if (named) { students++; used = true; }
        if (hasGrade(student)) { used = true; grades += Object.values(["d", "d2", "m"].reduce(function (all, group) { Object.assign(all, student[group] || {}); return all; }, {})).filter(function (value) { return value != null && String(value).trim() !== ""; }).length; }
      });
      if (used) sections++;
    }); });
    return { students: students, sections: sections, grades: grades, current: current };
  }
  function renderHome() {
    var app = window.SijilApp;
    if (!app || !app.getBook) return;
    var book = app.getBook(), summary = getSummary(book), profile = {};
    try { profile = JSON.parse(localStorage.getItem("student-grades-onboarding-v2") || localStorage.getItem("student-grades-onboarding-v1") || "null") || {}; } catch (_) {}
    var teacher = document.getElementById("m-teacher").value || profile.name || "المدرس/ة";
    var school = document.getElementById("m-school").value || profile.school || "";
    var subject = document.getElementById("m-subject").value || profile.subject || "";
    var gradeSelect = document.getElementById("grade-select"), gradeName = gradeSelect && gradeSelect.options[gradeSelect.selectedIndex] ? gradeSelect.options[gradeSelect.selectedIndex].text : "";
    var sectionName = document.getElementById("section-picker-toggle").textContent || "الشعبة";
    var students = (summary.current.students || []).map(function (item, index) { return item && String(item.name || "").trim() ? '<tr><td>' + (index + 1) + '</td><td><strong>' + escape(item.name) + '</strong></td><td>' + (hasGrade(item) ? 'توجد درجات' : 'لم تُدخل الدرجات') + '</td></tr>' : ""; }).filter(Boolean).slice(0, 6);
    var stats = [["الطلبة المسجلون", summary.students, personIconMarkup, "في كل الشعب"], ["الشعب النشطة", summary.sections, "▦", "تحتوي طلبة أو درجات"], ["الدرجات المدخلة", summary.grades, "▤", "خانات درجات محفوظة"], ["طلبة هذه الشعبة", (summary.current.students || []).filter(function (x) { return x && String(x.name || "").trim(); }).length, personIconMarkup, sectionName]];
    var stageOption = document.getElementById("stage-select"), stageName = stageOption && stageOption.options[stageOption.selectedIndex] ? stageOption.options[stageOption.selectedIndex].text.replace("الدراسة ", "") : "";
    dashboard.innerHTML = '<div class="dashboard-welcome"><div><div class="dashboard-eyebrow">دفتر منظّم ودرجات واضحة</div><h2>أهلًا ' + escape(teacher) + '</h2><p>' + (school ? 'مدرسة ' + escape(school) + ' · ' : '') + (subject ? 'مادة ' + escape(subject) + ' · ' : '') + 'تابع درجاتك من لوحة واحدة.</p></div><div class="dashboard-class-pill">' + escape(stageName + (gradeName ? ' · ' + gradeName : '') + ' · ' + sectionName) + '</div></div><div class="dashboard-stats">' + stats.map(function (item) { return '<article class="dashboard-stat"><div class="dashboard-stat-top"><span>' + item[0] + '</span><span class="dashboard-stat-icon">' + item[2] + '</span></div><strong>' + item[1] + '</strong><small>' + escape(item[3]) + '</small></article>'; }).join("") + '</div><div class="dashboard-grid"><section class="dashboard-card"><div class="dashboard-card-head"><h3>الطلبة في الشعبة الحالية</h3><button class="dashboard-link" type="button" data-dashboard-action="students">عرض القائمة ←</button></div>' + (students.length ? '<table class="dashboard-roster"><thead><tr><th>الرقم</th><th>اسم الطالب/ة</th><th>حالة الدرجات</th></tr></thead><tbody>' + students.join("") + '</tbody></table>' : '<div class="dashboard-empty">لم تُضف أسماء في هذه الشعبة بعد. ابدأ بإضافة طالب.</div>') + '</section><section class="dashboard-card"><div class="dashboard-card-head"><h3>اختصارات</h3></div><div class="dashboard-quick-grid"><button class="dashboard-quick" data-dashboard-action="daily"><i>▤</i>إدخال الدرجات اليومية</button><button class="dashboard-quick" data-dashboard-action="monthly"><i>▦</i>الدرجات الشهرية</button><button class="dashboard-quick" data-dashboard-action="add-student"><i>＋</i>إضافة طالب</button><button class="dashboard-quick" data-dashboard-action="print"><i>↗</i>طباعة / PDF</button><button class="dashboard-quick" data-dashboard-action="settings"><i>⚙</i>بيانات المدرس والمدرسة</button></div><div class="dashboard-profile"><strong>بيانات السجل</strong><br>' + escape(stageName + (gradeName ? ' · ' + gradeName : '') + ' · ' + sectionName) + '</div></section></div>';
    var student = profile.schoolGender === "girls" ? "الطالبة" : "الطالب", studentsLabel = profile.schoolGender === "girls" ? "الطالبات" : "الطلاب";
    var rosterTitle = dashboard.querySelector(".dashboard-roster th:nth-child(2)"), rosterHeading = dashboard.querySelector(".dashboard-card h3"), addStudentAction = dashboard.querySelector('[data-dashboard-action="add-student"]');
    if (rosterTitle) rosterTitle.textContent = "اسم " + student;
    if (rosterHeading) rosterHeading.textContent = studentsLabel + " في الشعبة الحالية";
    if (addStudentAction) addStudentAction.innerHTML = "<i>＋</i>إضافة " + student;
    var classPill = dashboard.querySelector(".dashboard-class-pill");
    if (classPill) {
      classPill.setAttribute("role", "button");
      classPill.setAttribute("tabindex", "0");
      classPill.setAttribute("aria-haspopup", "dialog");
      classPill.setAttribute("aria-label", "اختيار الصف والشعبة");
      classPill.addEventListener("click", openClassPicker);
      classPill.addEventListener("keydown", function (event) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openClassPicker(); } });
    }
    var first = String(teacher || "م").trim();
    var statLabels = dashboard.querySelectorAll(".dashboard-stat-top span:first-child");
    if (statLabels[0]) statLabels[0].textContent = studentsLabel + " المسجلون";
    if (statLabels[3]) statLabels[3].textContent = studentsLabel + " هذه الشعبة";
    var emptyRoster = dashboard.querySelector(".dashboard-empty");
    if (emptyRoster) emptyRoster.textContent = "لم تُضف أسماء " + studentsLabel + " في هذه الشعبة بعد.";
    avatar.textContent = first ? first.slice(0, 1).toLocaleUpperCase() : "م";
  }

  function setTab(view) {
    var id = view === "monthly" ? "t-monthly" : view === "daily2" ? "t-daily2" : "t-daily";
    var button = document.getElementById(id);
    if (button) { programmaticTabChange = true; button.click(); programmaticTabChange = false; }
  }
  function setView(view, persist) {
    view = ["home", "daily", "daily2", "monthly", "students", "distribution", "settings"].indexOf(view) >= 0 ? view : "home";
    main.classList.toggle("dashboard-home", view === "home");
    main.classList.toggle("settings-view", view === "settings");
    main.classList.toggle("distribution-view", view === "distribution");
    settingsPage.hidden = view !== "settings";
    distributionPage.hidden = view !== "distribution";
    nav.querySelectorAll("[data-app-view]").forEach(function (button) { button.classList.toggle("active", button.dataset.appView === view); });
    if (view === "daily" || view === "daily2" || view === "monthly") setTab(view);
    if (view === "students") {
      main.classList.remove("dashboard-home");
      setTab("daily");
      setTimeout(function () { var search = document.getElementById("search"); if (search) { search.scrollIntoView({ behavior: "smooth", block: "center" }); search.focus(); } }, 40);
    }
    if (view === "settings") {
      main.classList.remove("dashboard-home");
      if (settings) settings.open = false;
      renderWelcomeProfile();
      settingsPage.scrollTop = 0;
    }
    if (view === "home") renderHome();
    if (persist !== false) { try { localStorage.setItem(VIEW_KEY, view); } catch (_) {} }
  }

  nav.addEventListener("click", function (event) {
    var button = event.target.closest("[data-app-view]");
    if (button) { setView(button.dataset.appView); return; }
  });
  settingsPage.addEventListener("click", function (event) { if (event.target.closest("[data-open-distribution]")) setView("distribution"); });
  [["t-daily", "daily"], ["t-daily2", "daily2"], ["t-monthly", "monthly"]].forEach(function (item) {
    var button = document.getElementById(item[0]);
    if (button) button.addEventListener("click", function () {
      if (programmaticTabChange || main.classList.contains("dashboard-home")) return;
      nav.querySelectorAll("[data-app-view]").forEach(function (entry) { entry.classList.toggle("active", entry.dataset.appView === item[1]); });
      try { localStorage.setItem(VIEW_KEY, item[1]); } catch (_) {}
    });
  });
  dashboard.addEventListener("click", function (event) {
    var action = event.target.closest("[data-dashboard-action]");
    if (!action) return;
    var choice = action.dataset.dashboardAction;
    if (choice === "daily" || choice === "monthly" || choice === "students" || choice === "settings") { setView(choice); return; }
    if (choice === "add-student") { setView("daily"); setTimeout(function () { var add = document.querySelector(".pane:not([hidden]) .add-student"); if (add) add.click(); }, 60); }
    if (choice === "print") { setView("daily"); setTimeout(function () { var print = document.getElementById("print"); if (print) print.click(); }, 60); }
  });
  window.addEventListener("sijil-book-updated", function () { if (main.classList.contains("dashboard-home")) renderHome(); });
  window.addEventListener("sijil-profile-role", function (event) {
    roleImage = event.detail && (event.detail.role === "teacheress" || event.detail.role === "instructress") ? "female" : "male";
    personIconMarkup = '<img class="person-icon" src="./person-' + roleImage + '.png" alt="" aria-hidden="true">';
    var studentsIcon = nav.querySelector('[data-app-view="students"] .nav-icon');
    if (studentsIcon) studentsIcon.innerHTML = personIconMarkup;
    if (main.classList.contains("dashboard-home")) renderHome();
  });
  document.addEventListener("click", function (event) { if (event.target.closest(".app-settings summary")) setView("settings"); });
  var savedView = "home";
  try { savedView = localStorage.getItem(VIEW_KEY) || "home"; } catch (_) {}
  setView(savedView, false);
})();
