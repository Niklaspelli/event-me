import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

interface Friend {
  id: string;
  displayName?: string;
}

export const sendEventInvitations = async (
  friends: Friend[],
  eventId: string,
  eventTitle: string,
  currentUser: { uid: string; displayName?: string | null },
) => {
  if (friends.length === 0) return [];

  try {
    const promises = friends.map((friend) =>
      addDoc(collection(db, "eventInvitations"), {
        eventId: eventId,
        eventTitle: eventTitle,
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
};
