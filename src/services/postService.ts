// services/postService.ts
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { createNotification } from "./notificationsService";

export const addPostAndNotify = async (
  eventId: string,
  eventTitle: string,
  text: string,
  user: any,
) => {
  // 1. Spara inlägget
  await addDoc(collection(db, "events", eventId, "posts"), {
    text,
    createdAt: serverTimestamp(),
    uid: user.uid,
    displayName: user.displayName || "Anonym",
    photoURL: user.photoURL || "/default-avatar.png",
    likes: [],
  });

  // 2. Hantera notiser
  const attendeesSnap = await getDocs(
    collection(db, "events", eventId, "attendees"),
  );
  const notifPromises = attendeesSnap.docs.map((attendeeDoc) => {
    if (attendeeDoc.id === user.uid) return null;
    return createNotification(
      attendeeDoc.id,
      "FEED_POST",
      `${user.displayName} skrev i flödet för "${eventTitle}"`,
      eventId,
    );
  });
  await Promise.all(notifPromises);
};

export const toggleLike = async (
  eventId: string,
  postId: string,
  user: { uid: string; displayName: string; photoURL: string },
  currentLikes: any[], // Array av objekt: {uid, displayName, photoURL}
) => {
  const postRef = doc(db, "events", eventId, "posts", postId);

  // 1. Hitta om användaren redan finns i listan (vi matchar på UID)
  const existingLike = currentLikes?.find((l) => l.uid === user.uid);

  if (existingLike) {
    // 2. Om de redan gillat: Ta bort det exakta objektet som fanns där
    await updateDoc(postRef, {
      likes: arrayRemove(existingLike),
    });
  } else {
    // 3. Om de inte gillat: Lägg till ett objekt med namn och bild
    const newLike = {
      uid: user.uid,
      displayName: user.displayName || "Anonym",
      photoURL: user.photoURL || "",
    };

    await updateDoc(postRef, {
      likes: arrayUnion(newLike),
    });
  }
};
