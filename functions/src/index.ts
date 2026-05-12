import * as functionsV1 from "firebase-functions/v1";
import { onDocumentDeleted } from "firebase-functions/v2/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import * as admin from "firebase-admin";

setGlobalOptions({ region: "europe-west1" });

if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

// --- 1. RADERA ANVÄNDARKONTO ---
export const onUserAccountCleanup = functionsV1
  .region("europe-west1")
  .auth.user()
  .onDelete(async (user: any) => {
    const userId = user.uid;
    const batch = db.batch();

    console.log(`--- TOTALRENSNING STARTAR FÖR: ${userId} ---`);

    try {
      const userRef = db.collection("users").doc(userId);

      // A. RENSA ANVÄNDARENS EGEN VÄNLISTA (Sub-collection)
      const ownFriendsSnap = await userRef.collection("friends").get();
      ownFriendsSnap.forEach((doc) => batch.delete(doc.ref));

      // B. RADERA ANVÄNDARPROFILEN
      batch.delete(userRef);

      // C. RADERA ANVÄNDARENS EGNA EVENTS (Triggar onEventDelete)
      const eventsSnapshot = await db
        .collection("events")
        .where("createdBy", "==", userId)
        .get();
      eventsSnapshot.forEach((doc) => batch.delete(doc.ref));

      // D. RADERA ANVÄNDAREN FRÅN ANDRAS VÄNLISTOR
      const allFriendships = await db.collectionGroup("friends").get();
      allFriendships.forEach((doc) => {
        if (doc.id === userId) batch.delete(doc.ref);
      });

      // E. RADERA MAIL (Matchat mot fältet 'userId' i din bild)
      const mailSnap = await db
        .collection("mail")
        .where("userId", "==", userId)
        .get();
      mailSnap.forEach((doc) => batch.delete(doc.ref));

      // F. RADERA NOTIFIKATIONER (Matchat mot fältet 'toId' i din bild)
      const notifSnap = await db
        .collection("notifications")
        .where("toId", "==", userId)
        .get();
      notifSnap.forEach((doc) => batch.delete(doc.ref));

      await batch.commit();
      console.log(
        `✅ TOTALRENSNING KLAR: Profil, Events, Vänner, Mail och Notiser raderade.`,
      );
    } catch (error) {
      console.error("❌ Fel vid totalrensning:", error);
    }
  });

// --- 2. RADERA EVENT-DATA (När ett event tas bort) ---
export const onEventDelete = onDocumentDeleted(
  "events/{eventId}",
  async (event: any) => {
    const eventId = event.params.eventId;
    const batch = db.batch();

    if (!event.data) return;
    const eventRef = event.data.ref;

    try {
      // A. Radera POSTS
      const postsSnap = await eventRef.collection("posts").get();
      postsSnap.forEach(
        (doc: { ref: admin.firestore.DocumentReference<any, any> }) =>
          batch.delete(doc.ref),
      );

      // B. Radera ATTENDEES
      const attendeesSnap = await eventRef.collection("attendees").get();
      attendeesSnap.forEach(
        (doc: { ref: admin.firestore.DocumentReference<any, any> }) =>
          batch.delete(doc.ref),
      );

      // C. Radera INBJUDNINGAR
      const invSnap = await db
        .collection("eventInvitations")
        .where("eventId", "==", eventId)
        .get();
      invSnap.forEach((doc) => batch.delete(doc.ref));

      // D. RADERA MAIL (Baserat på eventId)
      const mailSnap = await db
        .collection("mail")
        .where("eventId", "==", eventId)
        .get();
      mailSnap.forEach((doc) => batch.delete(doc.ref));

      // E. RADERA NOTIFIKATIONER (Baserat på eventId) - DETTA TOG BORT "SEPPONEN"
      const notifSnap = await db
        .collection("notifications")
        .where("eventId", "==", eventId)
        .get();
      notifSnap.forEach((doc) => batch.delete(doc.ref));

      console.log(
        `Städning klar: Raderade ${notifSnap.size} notiser för event ${eventId}`,
      );

      await batch.commit();
    } catch (error) {
      console.error("❌ Fel vid rensning av event-data:", error);
    }
  },
);
