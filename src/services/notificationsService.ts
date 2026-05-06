import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";

/**
 * Markera en enskild notis som läst
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notifRef = doc(db, "notifications", notificationId);
    await updateDoc(notifRef, { isRead: true });
  } catch (error) {
    console.error("Fel vid uppdatering av notis:", error);
  }
};

/**
 * Skapa en ny notis till en användare
 * Används för t.ex. FEED_POST eller EVENT_CANCELLED
 */
export const createNotification = async (
  toId: string,
  type: "EVENT_CANCELLED" | "FEED_POST" | "GENERAL",
  message: string,
  eventId?: string,
) => {
  try {
    await addDoc(collection(db, "notifications"), {
      toId,
      type,
      message,
      eventId: eventId || null,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Kunde inte skapa notis:", error);
  }
};

/**
 * Ta bort en notis helt (valfritt, om du vill städa istället för att bara markera som läst)
 */
export const deleteNotification = async (notificationId: string) => {
  try {
    await deleteDoc(doc(db, "notifications", notificationId));
  } catch (error) {
    console.error("Kunde inte radera notis:", error);
  }
};
