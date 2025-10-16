importScripts("https://www.gstatic.com/firebasejs/9.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging.js");

const firebaseConfig = {
    apiKey: "YOUR_VITE_FIREBASE_API_KEY",
    authDomain: "YOUR_VITE_FIREBASE_AUTH_DOMAIN",
    projectId: "YOUR_VITE_FIREBASE_PROJECT_ID",
    storageBucket: "YOUR_VITE_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "YOUR_VITE_FIREBASE_MESSAGING_SENDER_ID",
    appId: "YOUR_VITE_FIREBASE_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/firebase-logo.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
