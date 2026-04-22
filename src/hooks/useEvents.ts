/* import { useState, useEffect } from "react";
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
 */

import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collectionGroup,
  query,
  where,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "../Context/AuthContext";

export const useEvents = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth() as any;

  useEffect(() => {
    // Om användaren inte är laddad än, vänta...
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    // Enkel sökning utan "orderBy" för att garantera att den fungerar direkt
    const q = query(
      collectionGroup(db, "attendees"),
      where("uid", "==", user.uid),
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const eventPromises = snapshot.docs.map(async (attendeeDoc) => {
          // Gå från /attendees/{uid} upp till /events/{eventId}
          const eventRef = attendeeDoc.ref.parent.parent;

          if (eventRef) {
            const eventSnap = await getDoc(eventRef);

            if (eventSnap.exists()) {
              const eventData = eventSnap.data();

              // Vi slår ihop datan från huvud-eventet med deltagar-statusen
              return {
                id: eventSnap.id,
                ...eventData,
                myStatus: attendeeDoc.data().status,
                // Fallback om datetime saknas i huvud-doc (för sortering)
                datetime: eventData.datetime || attendeeDoc.data().datetime,
              };
            }
          }
          return null;
        });

        const resolvedEvents = (await Promise.all(eventPromises)).filter(
          (e) => e !== null,
        );

        // Sortera manuellt i koden (gör att vi slipper komplexa index i Firebase)
        resolvedEvents.sort(
          (a: any, b: any) =>
            new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
        );

        setEvents(resolvedEvents);
      } catch (error) {
        console.error("Fel vid rendering:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return { events, loading };
};
