import { useEffect, useCallback } from 'react';
import { messaging } from '@/firebase/config';
import { getToken, onMessage } from 'firebase/messaging';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { toast } from 'sonner';

const VAPID_KEY = import.meta.env.VITE_APP_VAPID_KEY;

export const useNotifications = () => {
  const requestNotificationPermission = useCallback(async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (currentToken) {
          console.log('FCM Token:', currentToken);
          const tokensCollection = collection(db, 'fcm_tokens');
          await addDoc(tokensCollection, {
            token: currentToken,
            createdAt: serverTimestamp(),
          });
          toast.success('Notifications enabled!');
        } else {
          console.log('No registration token available. Request permission to generate one.');
          toast.error('Could not get notification token.');
        }
      } else {
        toast.error('Notification permission denied.');
      }
    } catch (error) {
      console.error('An error occurred while retrieving token. ', error);
      toast.error('An error occurred while enabling notifications.');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      toast.info(payload.notification?.title, {
        description: payload.notification?.body,
        action: {
            label: "View",
            onClick: () => window.location.href = payload.fcmOptions?.link || '/',
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { requestNotificationPermission };
};