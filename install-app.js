(function(){
  "use strict";
  var deferredPrompt=null;
  var installButton=document.getElementById("install-app-android");
  var status=document.getElementById("install-app-status");
  if(!installButton||!status)return;
  var choiceOpen=document.getElementById("install-choice-open");
  var choicePanel=document.getElementById("install-choice-panel");
  var iosHelp=document.getElementById("install-choice-ios-help");
  var apkLink=document.getElementById("android-apk-download");
  var androidChoice=document.getElementById("install-choice-android");
  var iosChoice=document.getElementById("install-choice-ios");
  var linkChoice=document.getElementById("install-choice-link");
  if(choiceOpen&&choicePanel){
    choiceOpen.addEventListener("click",function(){
      var opening=choicePanel.hidden;
      choicePanel.hidden=!opening;
      choiceOpen.setAttribute("aria-expanded",String(opening));
      if(opening&&androidChoice)androidChoice.focus();
    });
  }
  if(androidChoice){androidChoice.addEventListener("click",function(){
    if(iosHelp)iosHelp.hidden=true;
    if(apkLink)apkLink.click();
  });}
  if(iosChoice){iosChoice.addEventListener("click",function(){
    if(iosHelp){iosHelp.hidden=false;iosHelp.focus();}
  });}
  if(linkChoice){linkChoice.addEventListener("click",function(){
    window.open("https://sijil-darajat-al-tullab.onrender.com/","_blank","noopener,noreferrer");
  });}
  window.addEventListener("beforeinstallprompt",function(event){
    event.preventDefault();
    deferredPrompt=event;
    installButton.hidden=false;
  });
  installButton.addEventListener("click",async function(){
    if(!deferredPrompt){status.textContent="للتثبيت، افتح الرابط في Chrome ثم القائمة ⋮ واختر تثبيت التطبيق.";return;}
    deferredPrompt.prompt();
    var result=await deferredPrompt.userChoice;
    deferredPrompt=null;
    if(result&&result.outcome==="accepted"){installButton.hidden=true;status.textContent="بدأ تثبيت التطبيق. أكمل الخطوات التي تظهر على الشاشة.";}
    else{status.textContent="تم إلغاء التثبيت. يمكنك المحاولة من قائمة Chrome.";}
  });
  window.addEventListener("appinstalled",function(){
    installButton.hidden=true;
    status.textContent="أُضيف التطبيق إلى جهازك.";
  });
})();
