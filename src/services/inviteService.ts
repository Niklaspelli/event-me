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
  email?: string;
}

// 1. SKICKA INBJUDAN (Både i appen och via Mail)
export const sendEventInvitations = async (
  friends: Friend[],
  eventId: string,
  eventTitle: string,
  eventDate: string,
  location: string, // La till denna så den kan visas i mailet
  email: string,
  currentUser: { uid: string; displayName?: string | null },
) => {
  console.log("INVITE_SERVICE_RECIEVED:", { eventTitle, location, eventDate });
  if (friends.length === 0) return [];
  if (!eventDate)
    throw new Error("eventDate är undefined. Kan inte skicka inbjudan.");
  const safeLocation = location || "Plats ej angiven";
  const promises = friends.map(async (friend) => {
    // A. Skapa notisen i appen
    await addDoc(collection(db, "eventInvitations"), {
      eventId,
      eventTitle,
      eventDate,
      location: safeLocation || "Okänd plats",
      fromId: currentUser.uid,
      fromName: currentUser.displayName || "En vän",
      toId: friend.id,
      status: "pending",
      email: email || "Ingen e-post angiven",
      timestamp: serverTimestamp(),
    });
    console.log(`Kollar mail för ${friend.displayName}:`, friend.email);
    // B. Skicka Mail via Trigger Email Extension
    if (friend.email) {
      await addDoc(collection(db, "mail"), {
        to: friend.email,
        message: {
          subject: `Inbjudan till: ${eventTitle} 🎉`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
              <h2 style="color: #0d6efd;">Hej ${friend.displayName || "vän"}!</h2>
              <p><strong>${currentUser.displayName || "En vän"}</strong> har bjudit in dig till ett event!</p>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0d6efd;">
                <h3 style="margin: 0;">${eventTitle}</h3>
                <p style="margin: 5px 0;">📍 <strong>Var:</strong> ${safeLocation}</p>
                <p style="margin: 5px 0;">📅 <strong>När:</strong> ${eventDate}</p>
              </div>
              <p>Öppna appen för att logga in och svara.</p>
              <br>
              <a href="https://event-me-322a8.web.app/events/event-details/${eventId}" 
                 style="display: inline-block; background-color: #0d6efd; color: white; padding: 12px 25px; text-decoration: none; border-radius: 30px; font-weight: bold;">
                 Visa inbjudan & OSA
              </a>
            </div>
          `,
        },
      });
    }
  });

  return await Promise.all(promises);
};

// 2. ACCEPTERA INBJUDAN
export const acceptEventInvite = async (user: any, invitation: any) => {
  if (!invitation.eventId || !invitation.eventDate) {
    throw new Error("Inbjudan saknar nödvändig data.");
  }

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
    datetime: invitation.eventDate,
    joinedAt: serverTimestamp(),
  });

  const inviteRef = doc(db, "eventInvitations", invitation.id);
  await updateDoc(inviteRef, { status: "accepted" });
};

// 3. NEKA INBJUDAN
export const declineEventInvite = async (invitationId: string) => {
  const inviteRef = doc(db, "eventInvitations", invitationId);
  await updateDoc(inviteRef, { status: "declined" });
};
