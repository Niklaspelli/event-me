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
  userId: string,
  currentLikes: string[],
) => {
  const postRef = doc(db, "events", eventId, "posts", postId);
  const isLiked = currentLikes.includes(userId);
  await updateDoc(postRef, {
    likes: isLiked ? arrayRemove(userId) : arrayUnion(userId),
  });
};
