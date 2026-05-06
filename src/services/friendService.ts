import { db } from "../firebase";
import {
  doc,
  writeBatch,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";

export const acceptFriendRequest = async (req: any, currentUser: any) => {
  const DEFAULT = "/default-avatar.png";
  const batch = writeBatch(db);

  // Lägg till i mina vänner
  const myFriendRef = doc(db, "users", currentUser.uid, "friends", req.fromId);
  batch.set(myFriendRef, {
    displayName: req.fromName,
    email: req.fromEmail || "",
    photoURL: req.fromPhoto || DEFAULT,
    addedAt: serverTimestamp(),
  });

  // Lägg till i deras vänner
  const theirFriendRef = doc(
    db,
    "users",
    req.fromId,
    "friends",
    currentUser.uid,
  );
  batch.set(theirFriendRef, {
    displayName: currentUser.displayName || "Anonym",
    email: currentUser.email || "",
    photoURL: currentUser.photoURL || DEFAULT,
    addedAt: serverTimestamp(),
  });

  // Ta bort förfrågan
  batch.delete(doc(db, "friendRequests", req.id));

  return await batch.commit();
};

export const declineFriendRequest = async (requestId: string) => {
  await deleteDoc(doc(db, "friendRequests", requestId));
};
