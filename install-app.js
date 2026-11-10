(function(){
  "use strict";
  var deferredPrompt=null;
  var installButton=document.getElementById("install-app-android");
  var status=document.getElementById("install-app-status");
  if(!installButton||!status)return;
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
