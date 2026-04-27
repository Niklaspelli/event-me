import { auth, db } from "../firebase";
import { User } from "firebase/auth"; // Inbyggd typ från Firebase
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import type { UserTypes } from "../types/types";

export const updateUserData = async (user: User): Promise<void> => {
  const userRef = doc(db, "users", user.uid);

  const data: Partial<UserTypes> = {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    // Vi castar serverTimestamp för att Firestore ska acceptera det
    lastLogin: serverTimestamp() as any,
  };

  await setDoc(userRef, data, { merge: true });
};
