/* import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  collectionGroup,
} from "firebase/firestore";
import { deleteUser, type User } from "firebase/auth";
import { db } from "../firebase";

export const deleteUserCompletely = async (user: User) => {
  const uid = user.uid;
  const userEmail = user.email;
  const batch = writeBatch(db);

  // 1. Samla alla referenser som ska bort
  // Events skapade av användaren
  const eventsSnap = await getDocs(
    query(collection(db, "events"), where("createdBy", "==", uid)),
  );
  eventsSnap.forEach((d) => batch.delete(d.ref));

  // Attendees (överallt)
  const attendeeSnap = await getDocs(
    query(collectionGroup(db, "attendees"), where("uid", "==", uid)),
  );
  attendeeSnap.forEach((d) => batch.delete(d.ref));

  // Inbjudningar
  const inviteSent = await getDocs(
    query(collection(db, "eventInvitations"), where("fromId", "==", uid)),
  );
  const inviteRec = await getDocs(
    query(collection(db, "eventInvitations"), where("toId", "==", uid)),
  );
  inviteSent.forEach((d) => batch.delete(d.ref));
  inviteRec.forEach((d) => batch.delete(d.ref));

  // Notiser
  const notifSnap = await getDocs(
    query(collection(db, "notifications"), where("toId", "==", uid)),
  );
  notifSnap.forEach((d) => batch.delete(d.ref));

  // Mail
  if (userEmail) {
    const mailToSnap = await getDocs(
      query(collection(db, "mail"), where("to", "==", userEmail)),
    );
    mailToSnap.forEach((d) => batch.delete(d.ref));
  }
  const mailOwnerSnap = await getDocs(
    query(collection(db, "mail"), where("userId", "==", uid)),
  );
  mailOwnerSnap.forEach((d) => batch.delete(d.ref));

  // Själva användardokumentet
  batch.delete(doc(db, "users", uid));

  // 2. Utför radering i Firestore
  await batch.commit();

  // 3. Radera Auth-kontot (måste ske sist)
  await deleteUser(user);
};
 */

import {
  getAuth,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

export const deleteUserCompletely = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) return;

  try {
    await deleteUser(user);
    console.log("Kontot raderat, Cloud Function påbörjar städning...");
  } catch (error: any) {
    if (error.code === "auth/requires-recent-login") {
      // Här kan du antingen skicka användaren till logga in-sidan igen
      // eller visa en popup som ber om lösenordet för att re-autentisera.
      console.error(
        "Användaren måste logga in på nytt innan kontot kan raderas.",
      );
      throw new Error(
        "Du måste logga in igen för att kunna radera ditt konto.",
      );
    }
    throw error;
  }
};
