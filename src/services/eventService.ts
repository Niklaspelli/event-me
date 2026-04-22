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
    // --- NY LOGIK FÖR ATT EXTRAHERA STAD ---
    // Vi antar att adressen ser ut som "Gata 1, Stad" eller bara "Stad"
    const locationParts = eventData.location.split(",");
    const city =
      locationParts.length > 1
        ? locationParts[locationParts.length - 1].trim() // Tar det som står efter sista kommatecknet
        : eventData.location.trim(); // Om inget komma finns, använd hela strängen
    // ---------------------------------------
    // 1. Skapa själva eventet (utan attendees-arrayen)
    const docRef = await addDoc(collection(db, "events"), {
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      city: city,
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
  const q = query(collectionGroup(db, "attendees"), where("uid", "==", userId));

  return onSnapshot(q, async (snapshot) => {
    const eventPromises = snapshot.docs.map(async (attendeeDoc) => {
      const attendeeData = attendeeDoc.data();
      const eventRef = attendeeDoc.ref.parent.parent;

      if (eventRef) {
        const eventSnap = await getDoc(eventRef);

        if (eventSnap.exists()) {
          const eventData = eventSnap.data();

          // VIKTIGT: Vi bygger objektet kontrollerat
          return {
            id: eventSnap.id,
            // Data från huvud-eventet (Värden, beskrivning, etc)
            title: eventData.title,
            description: eventData.description,
            location: eventData.location,
            city: eventData.city,
            datetime: eventData.datetime,
            creatorName: eventData.creatorName,
            createdBy: eventData.createdBy,

            // Data från deltagar-posten (Din personliga status)
            myStatus: attendeeData.status,
            myDisplayName: attendeeData.displayName,
            joinedAt: attendeeData.joinedAt,
          };
        }
      }
      return null;
    });

    const events = (await Promise.all(eventPromises)).filter((e) => e !== null);
    callback(events);
  });
};
