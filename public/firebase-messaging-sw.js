importScripts('https://www.gstatic.com/firebasejs/10.11.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCo4VLD0stXjqOsmaQhJtqXrcY3A7rJsOM",
  authDomain: "piwc-asokwa-site.firebaseapp.com",
  projectId: "piwc-asokwa-site",
  storageBucket: "piwc-asokwa-site.appspot.com",
  messagingSenderId: "42717543779",
  appId: "1:42717543779:web:def05fe5dac43a33f0a756"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
