/* import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

interface Friend {
  id: string;
  displayName?: string;
}

export const sendEventInvitations = async (
  friends: Friend[],
  eventId: string,
  eventTitle: string,
  eventDate,
  currentUser: { uid: string; displayName?: string | null },
) => {
  if (friends.length === 0) return [];

  try {
    const promises = friends.map((friend) =>
      addDoc(collection(db, "eventInvitations"), {
        eventId: eventId,
        eventTitle: eventTitle,
        eventDate: eventDate,
        fromId: currentUser.uid,
        fromName: currentUser.displayName || "En vän",
        toId: friend.id,
        status: "pending",
        timestamp: serverTimestamp(),
      }),
    );

    const results = await Promise.all(promises);
    console.log(`${results.length} inbjudningar skickades.`);
    return results;
  } catch (error) {
    console.error("Fel vid utskick av inbjudningar:", error);
    throw error; // Kasta felet vidare så att din komponent kan visa ett felmeddelande
  }
}; */

import { db } from "../firebase";

import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

interface Friend {
  id: string;
  displayName?: string;
}

// 1. SKICKA INBJUDAN (Befintlig logik, lite säkrare)
export const sendEventInvitations = async (
  friends: Friend[],
  eventId: string,
  eventTitle: string,
  eventDate: string,
  currentUser: { uid: string; displayName?: string | null },
) => {
  if (friends.length === 0) return [];
  if (!eventDate)
    throw new Error("eventDate är undefined. Kan inte skicka inbjudan.");

  const promises = friends.map((friend) =>
    addDoc(collection(db, "eventInvitations"), {
      eventId,
      eventTitle,
      eventDate,
      fromId: currentUser.uid,
      fromName: currentUser.displayName || "En vän",
      toId: friend.id,
      status: "pending",
      timestamp: serverTimestamp(),
    }),
  );

  const results = await Promise.all(promises);
  return results;
};

// 2. ACCEPTERA INBJUDAN (Ny!)
export const acceptEventInvite = async (user: any, invitation: any) => {
  if (!invitation.eventId || !invitation.eventDate) {
    throw new Error("Inbjudan saknar nödvändig data.");
  }

  // Skapa deltagar-dokumentet (biljetten)
  const attendeeRef = doc(
    db,
    "events",
    invitation.eventId,
    "attendees",
    user.uid,
  );

  await setDoc(attendeeRef, {
    uid: user.uid,
    displayName: user.displayName || "Anonym",
    photoURL: user.photoURL || "",
    status: "going",
    title: invitation.eventTitle,
    datetime: invitation.eventDate, // Viktigt för "Mina Events"-listan
    joinedAt: serverTimestamp(),
  });

  // Uppdatera status på inbjudan
  const inviteRef = doc(db, "eventInvitations", invitation.id);
  await updateDoc(inviteRef, { status: "accepted" });
};

// 3. NEKA INBJUDAN (Ny!)
export const declineEventInvite = async (invitationId: string) => {
  const inviteRef = doc(db, "eventInvitations", invitationId);
  await updateDoc(inviteRef, { status: "declined" });
};
