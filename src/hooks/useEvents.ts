import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collectionGroup,
  query,
  where,
  onSnapshot,
  getDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "../Context/AuthContext";

export const useEvents = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth() as any;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Vi letar efter ditt UID i alla 'attendees'-mappar i hela databasen
    const q = query(
      collectionGroup(db, "attendees"),
      where("uid", "==", user.uid),
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const eventPromises = snapshot.docs.map(async (attendeeDoc) => {
          // attendeeDoc.ref.parent är 'attendees'-kollektionen
          // attendeeDoc.ref.parent.parent är själva event-dokumentet
          const eventRef = attendeeDoc.ref.parent.parent;

          if (eventRef) {
            const eventSnap = await getDoc(eventRef);
            if (eventSnap.exists()) {
              return { id: eventSnap.id, ...eventSnap.data() };
            }
          }
          return null;
        });

        const resolvedEvents = (await Promise.all(eventPromises)).filter(
          (e) => e !== null,
        );

        // Sortera så att närmaste eventet kommer först
        resolvedEvents.sort(
          (a, b) =>
            new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
        );

        setEvents(resolvedEvents);
      } catch (error) {
        console.error("Fel vid hämtning av events:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  return { events, loading };
};
