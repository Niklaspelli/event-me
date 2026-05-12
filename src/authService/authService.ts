/* import { auth, db } from "../firebase";
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
 */

import { auth, db } from "../firebase";
import {
  type User,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import type { UserTypes } from "../types/types";

// 1. Befintlig funktion: Uppdatera användardata i Firestore
export const updateUserData = async (user: User): Promise<void> => {
  const userRef = doc(db, "users", user.uid);

  const data: Partial<UserTypes> = {
    uid: user.uid,
    displayName: user.displayName || "Anonym", // Fallback så att inbjudningar inte ser tomma ut    email: user.email,
    photoURL: user.photoURL,
    lastLogin: serverTimestamp() as any,
  };

  await setDoc(userRef, data, { merge: true });
};

// 2. Glömt lösenord: Skicka återställningsmail
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error("Fel vid återställningsmail:", error.code);
    throw error;
  }
};

// 3. Ändra lösenord: Kräver re-authentication för säkerhet
export const changeUserPassword = async (
  user: User,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  try {
    if (!user.email) throw new Error("Användarens e-post saknas.");

    // Firebase kräver att man loggat in nyligen för att ändra lösenord.
    // Vi skapar ett "credential" med nuvarande lösenord för att bekräfta identitet.
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword,
    );

    // A. Bekräfta identitet
    await reauthenticateWithCredential(user, credential);

    // B. Uppdatera till det nya lösenordet
    await updatePassword(user, newPassword);
  } catch (error: any) {
    console.error("Fel vid lösenordsbyte:", error.code);
    throw error;
  }
};
