import { db } from "../firebase";
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
