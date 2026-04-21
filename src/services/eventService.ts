// src/services/eventService.ts
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  setDoc,
  collectionGroup,
  query,
  where,
  onSnapshot, // Viktig import för steg 2!
} from "firebase/firestore";
import type { AppEvent } from "../types/types";
import { doc, getDoc } from "firebase/firestore";

export const createNewEvent = async (eventData: AppEvent) => {
  try {
    // 1. Skapa själva eventet (utan attendees-arrayen)
    const docRef = await addDoc(collection(db, "events"), {
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      datetime: eventData.datetime,
      createdBy: eventData.createdBy,
      creatorName: eventData.creatorName,
      createdAt: serverTimestamp(),
    });

    // 2. Skapa den FÖRSTA deltagaren (skaparen själv) i en SUB-COLLECTION
    const attendeeRef = doc(
      db,
      "events",
      docRef.id,
      "attendees",
      eventData.createdBy,
    );
    await setDoc(attendeeRef, {
      uid: eventData.createdBy,
      displayName: eventData.creatorName,
      photoURL: eventData.photoURL || "",
      status: "going",
      joinedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const getEventById = async (id: string) => {
  const docRef = doc(db, "events", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error("Eventet hittades inte");
  }
};

export const subscribeToMyEvents = (
  userId: string,
  callback: (events: any[]) => void,
) => {
  // Vi letar i alla 'attendees'-subcollections efter ditt UID
  const q = query(collectionGroup(db, "attendees"), where("uid", "==", userId));

  return onSnapshot(q, async (snapshot) => {
    // För varje ställe vi hittar dig, måste vi hämta själva huvud-eventet
    const eventPromises = snapshot.docs.map(async (attendeeDoc) => {
      // attendeeDoc.ref.parent.parent ger oss referensen till själva event-dokumentet
      const eventRef = attendeeDoc.ref.parent.parent;
      if (eventRef) {
        const eventSnap = await getDoc(eventRef);
        return { id: eventSnap.id, ...eventSnap.data() };
      }
      return null;
    });

    const events = (await Promise.all(eventPromises)).filter((e) => e !== null);
    callback(events);
  });
};
