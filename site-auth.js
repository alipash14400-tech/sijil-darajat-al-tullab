import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js';
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js';
import { firebaseConfig } from './apps/grades/firebase-config.js';

// A named Firebase app gives the site its own Auth instance and storage namespace.
const siteApp = initializeApp(firebaseConfig, 'tatbiqati-site-auth');
const auth = getAuth(siteApp);
const signedOut = document.getElementById('site-signed-out');
const signedIn = document.getElementById('site-signed-in');
const status = document.getElementById('site-account-status');
const loginButton = document.getElementById('site-google-login');
const logoutButton = document.getElementById('site-google-logout');
const setStatus = message => { status.textContent = message; };

setPersistence(auth, browserLocalPersistence).catch(error => {
  console.error('تعذر حفظ جلسة حساب الموقع:', error);
});

onAuthStateChanged(auth, user => {
  signedOut.hidden = Boolean(user);
  signedIn.hidden = !user;
  if (user) {
    document.getElementById('site-account-name').textContent = user.displayName || 'مستخدم Google';
    document.getElementById('site-account-email').textContent = user.email || '';
    const avatar = document.getElementById('site-account-avatar');
    if (user.photoURL) {
      avatar.src = user.photoURL;
      avatar.hidden = false;
    } else {
      avatar.removeAttribute('src');
      avatar.hidden = true;
    }
    setStatus('تم تسجيل الدخول إلى الموقع.');
  } else {
    setStatus('');
  }
});

loginButton.addEventListener('click', async () => {
  loginButton.disabled = true;
  setStatus('جارٍ فتح تسجيل Google...');
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
    setStatus('تم تسجيل الدخول إلى الموقع.');
  } catch (error) {
    if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment'].includes(error.code)) {
      try {
        await signInWithRedirect(auth, new GoogleAuthProvider());
        return;
      } catch (redirectError) {
        error = redirectError;
      }
    }
    console.error('تعذر تسجيل الدخول إلى الموقع:', error);
    setStatus(error.code === 'auth/unauthorized-domain'
      ? 'هذا النطاق يحتاج إلى إضافته في النطاقات المسموح بها ضمن Firebase Authentication.'
      : 'تعذر تسجيل الدخول. تحقق من اتصالك وحاول مرة أخرى.');
  } finally {
    loginButton.disabled = false;
  }
});

logoutButton.addEventListener('click', async () => {
  logoutButton.disabled = true;
  try {
    await signOut(auth);
    setStatus('تم تسجيل الخروج من الموقع.');
  } catch (error) {
    console.error('تعذر تسجيل الخروج من حساب الموقع:', error);
    setStatus('تعذر تسجيل الخروج. حاول مرة أخرى.');
  } finally {
    logoutButton.disabled = false;
  }
});

