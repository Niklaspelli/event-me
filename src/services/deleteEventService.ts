/* import { db } from "../firebase";
import {
  doc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";

//Raderar event och alla inbjudningar kopplade till det eventet

export const deleteEventService = async (eventId: string) => {
  const batch = writeBatch(db);

  // 1. Referens till huvud-eventet
  const eventRef = doc(db, "events", eventId);
  batch.delete(eventRef);

  // 2. STÄDA UNDERKOLLEKTIONER (Detta är steget som saknades)

  // Städa attendees
  const attendeesSnap = await getDocs(
    collection(db, "events", eventId, "attendees"),
  );
  attendeesSnap.forEach((doc) => batch.delete(doc.ref));

  // Städa posts (om du har sådana)
  const postsSnap = await getDocs(collection(db, "events", eventId, "posts"));
  postsSnap.forEach((doc) => batch.delete(doc.ref));

  // 3. STÄDA INBJUDNINGAR (Om de ligger i en topp-kollektion)
  const invQ = query(
    collection(db, "eventInvitations"),
    where("eventId", "==", eventId),
  );
  const invSnap = await getDocs(invQ);
  invSnap.forEach((doc) => batch.delete(doc.ref));

  // Kör allt samtidigt
  await batch.commit();
};
 */

import { db } from "../firebase";
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  writeBatch,
  addDoc,
} from "firebase/firestore";
import { createNotification } from "./notificationsService";

export const deleteEventService = async (
  eventId: string,
  eventTitle: string,
  currentUserId: string,
) => {
  const batch = writeBatch(db);
  /* 
  const eventRef = doc(db, "events", eventId);
  batch.delete(eventRef); */

  // --- 1. HÄMTA DELTAGARE & SKAPA MEJL-DOKUMENT ---
  const attendeesSnap = await getDocs(
    collection(db, "events", eventId, "attendees"),
  );

  // Vi använder en vanlig array för att vänta på alla mejl-dokument
  const emailPromises = attendeesSnap.docs.map(async (attendeeDoc) => {
    const attendeeId = attendeeDoc.id;

    // Skicka inte till den som raderar (skaparen)
    if (attendeeId === currentUserId) return;

    // Hämta deltagarens e-post från 'users'
    const userSnap = await getDoc(doc(db, "users", attendeeId));
    const userData = userSnap.data();

    await createNotification(
      attendeeId,
      "EVENT_CANCELLED",
      `Tråkiga nyheter: "${eventTitle}" har blivit inställt.`,
      eventId,
    );

    if (userData?.email) {
      // Vi lägger till mejlet i mail-collectionen via batchen eller addDoc
      // Eftersom Trigger Email Extension lyssnar på addDoc kör vi den här:
      await addDoc(collection(db, "mail"), {
        to: userData.email,
        message: {
          subject: `INSTÄLLT: ${eventTitle}`,
          html: `   
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0d6efd;">

          <h1>Tråkiga nyheter...</h1>
          <p style="font-size: 16px">Eventet <strong>${eventTitle}</strong> har blivit inställt av arrangören. Kontakta arrangören för mer information!</p>
           <p style="font-size: 16px">Hoppas vi ses på ett annat event snart!</p></div></div
        `,
        },
      });
    }
  });

  // Vänta tills alla mejl är "lagda på lådan"
  await Promise.all(emailPromises);

  // --- 2. STÄDA FIRESTORE (DIN BEFINTLIGA BATCH) ---

  // Radera huvud-eventet
  batch.delete(doc(db, "events", eventId));

  // Radera alla attendees (sub-collection)
  attendeesSnap.forEach((doc) => batch.delete(doc.ref));

  // Radera alla inbjudningar (topp-collection)
  const invQ = query(
    collection(db, "eventInvitations"),
    where("eventId", "==", eventId),
  );
  const invSnap = await getDocs(invQ);
  invSnap.forEach((doc) => batch.delete(doc.ref));

  // Kör alla raderingar samtidigt
  await batch.commit();
};
