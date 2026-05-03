// Självgående skript som körs i bakgrunden
importScripts(
  "https://www.gstatic.com/firebasejs/10.x.x/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.x.x/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "DIN_API_KEY",
  authDomain: "DITT_PROJEKT.firebaseapp.com",
  projectId: "DITT_PROJEKT",
  storageBucket: "DITT_PROJEKT.appspot.com",
  messagingSenderId: "DITT_ID",
  appId: "DITT_APP_ID",
});

const messaging = firebase.messaging();

// Denna lyssnar på notiser när appen är i bakgrunden
messaging.onBackgroundMessage((payload) => {
  console.log("Bakgrundsnotis mottagen:", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/pwa-192x192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
