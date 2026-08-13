import { messaging } from "./firebaseConfig";
import { getToken, onMessage } from "firebase/messaging";

export const requestNotificationPermission = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY // Add your VAPID key from Firebase Console
    });
    console.log("FCM Token:", token);
    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
  }
};

// Handle Incoming Notifications (Real-time)
export const onForegroundMessageListener = () => {
  onMessage(messaging, (payload) => {
    console.log("Message received:", payload);
    alert(`New Notification: ${payload.notification.title}`);
  });
};
