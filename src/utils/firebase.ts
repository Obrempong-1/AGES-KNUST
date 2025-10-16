
import { firebaseConfig } from '@/firebase/config';

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const firebaseConfigParams = new URLSearchParams({
        firebaseConfig: JSON.stringify(firebaseConfig)
      }).toString();

      navigator.serviceWorker.register(`/firebase-messaging-sw.js?${firebaseConfigParams}`)
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
};
