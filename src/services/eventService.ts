// src/services/eventService.ts
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import type { AppEvent } from "../types/types";
import { doc, getDoc } from "firebase/firestore";
export const createNewEvent = async (eventData: Partial<AppEvent>) => {
  try {
    const docRef = await addDoc(collection(db, "events"), {
      ...eventData,
      createdAt: serverTimestamp(),
      attendees: [eventData.createdBy], // Skaparen är automatiskt med
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
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
