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
    const userEmail = user.email;
    const batch = db.batch();

    console.log(`--- TOTALRENSNING STARTAR FÖR: ${userId} (${userEmail}) ---`);

    try {
      // VIKTIGT: Hämta användardokumentet för att få tag på namnet innan vi raderar det
      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();
      const userName = userDoc.data()?.displayName;

      // A. EGEN PROFIL & VÄNNER
      const ownFriendsSnap = await userRef.collection("friends").get();
      ownFriendsSnap.forEach((doc) => batch.delete(doc.ref));
      batch.delete(userRef);

      // B. EGNA EVENTS (Triggar onEventDelete)
      const eventsSnapshot = await db
        .collection("events")
        .where("createdBy", "==", userId)
        .get();
      eventsSnapshot.forEach((doc) => batch.delete(doc.ref));

      // C. FRÅN ANDRAS VÄNLISTOR
      const allFriendships = await db.collectionGroup("friends").get();
      allFriendships.forEach((doc) => {
        if (doc.id === userId) batch.delete(doc.ref);
      });

      // D. FRÅN ANDRAS DELTAGARLISTOR (Attendees)
      const allAttendance = await db.collectionGroup("attendees").get();
      allAttendance.forEach((doc) => {
        if (doc.id === userId) batch.delete(doc.ref);
      });

      // E. ALLA INLÄGG (Posts) SKRIVNA AV ANVÄNDAREN
      const allPosts = await db.collectionGroup("posts").get();
      allPosts.forEach((doc) => {
        if (doc.data().uid === userId) batch.delete(doc.ref);
      });

      // F. INBJUDNINGAR
      const invTo = await db
        .collection("eventInvitations")
        .where("toId", "==", userId)
        .get();
      const invFrom = await db
        .collection("eventInvitations")
        .where("fromId", "==", userId)
        .get();
      invTo.forEach((doc) => batch.delete(doc.ref));
      invFrom.forEach((doc) => batch.delete(doc.ref));

      // G. MAIL (Rensar bort loggar kopplade till användaren)
      const mailByUserId = await db
        .collection("mail")
        .where("userId", "==", userId)
        .get();
      mailByUserId.forEach((doc) => batch.delete(doc.ref));

      if (userEmail) {
        const mailByEmail = await db
          .collection("mail")
          .where("to", "==", userEmail)
          .get();
        mailByEmail.forEach((doc) => batch.delete(doc.ref));
      }

      // H. NOTIFIKATIONER (Där användaren är mottagare)
      const notifTo = await db
        .collection("notifications")
        .where("toId", "==", userId)
        .get();
      notifTo.forEach((doc) => batch.delete(doc.ref));

      // I. "SPÖK-NOTISER" (Där namnet nämns i klartext i andras flöden)
      if (userName) {
        const notifSnap = await db.collection("notifications").get();
        notifSnap.forEach((doc) => {
          const msg = doc.data().message || "";
          if (msg.includes(userName)) {
            batch.delete(doc.ref);
          }
        });
      }

      await batch.commit();
      console.log(`✅ TOTALRENSNING KLAR för ${userId}`);
    } catch (error) {
      console.error("❌ Fel vid totalrensning:", error);
    }
  });

// --- 2. RADERA EVENT-DATA ---
export const onEventDelete = onDocumentDeleted(
  "events/{eventId}",
  async (event: any) => {
    const eventId = event.params.eventId;
    const batch = db.batch();

    if (!event.data) return;
    const eventRef = event.data.ref;

    try {
      // A. POSTS & ATTENDEES (Sub-collections)
      const postsSnap = await eventRef.collection("posts").get();
      postsSnap.forEach(
        (doc: { ref: admin.firestore.DocumentReference<any, any> }) =>
          batch.delete(doc.ref),
      );

      const attendeesSnap = await eventRef.collection("attendees").get();
      attendeesSnap.forEach(
        (doc: { ref: admin.firestore.DocumentReference<any, any> }) =>
          batch.delete(doc.ref),
      );

      // B. INBJUDNINGAR, MAIL & NOTISER KOPPLADE TILL EVENTET
      const collections = ["eventInvitations", "mail", "notifications"];

      for (const col of collections) {
        const snap = await db
          .collection(col)
          .where("eventId", "==", eventId)
          .get();
        snap.forEach((doc) => batch.delete(doc.ref));
      }

      await batch.commit();
      console.log(`✅ Städning för event ${eventId} klar.`);
    } catch (error) {
      console.error("❌ Fel vid rensning av event-data:", error);
    }
  },
);
