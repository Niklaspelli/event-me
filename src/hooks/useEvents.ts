/* import { useState, useEffect } from "react";
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

        //sortera bort events som är gamla
        const now = new Date().getTime();

        const resolvedEvents = (await Promise.all(eventPromises)).filter(
          (e) => {
            return e !== null && new Date(e.datetime).getTime() >= now;
          },
        ) as any[];

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
 */

import { useState, useEffect } from "react";

import { useAuth } from "../Context/AuthContext";
import { subscribeToMyEvents } from "../services/eventService";

export const useEvents = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(5);
  const { user } = useAuth() as any;

  useEffect(() => {
    // Om användaren inte är laddad än, vänta...
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // Vi använder din subscribe-funktion som nu har orderBy(datetime) i backend
    const unsubscribe = subscribeToMyEvents(user.uid, (fetchedEvents) => {
      // Filtrera bort gamla events (valfritt, men rekommenderat för "Kommande")
      const now = new Date().getTime();
      const upcoming = fetchedEvents.filter(
        (e) => new Date(e.datetime).getTime() >= now,
      );
      setEvents(upcoming);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  // Logik för att "ladda fler" genom att öka visningsgränsen
  const loadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setDisplayLimit((prev) => prev + 5);
      setLoadingMore(false);
    }, 500);
  };

  const visibleEvents = events.slice(0, displayLimit);
  const hasMore = events.length > displayLimit;

  return {
    events: visibleEvents,
    allEvents: events,
    loading,
    loadingMore,
    loadMore,
    hasMore,
  };
};
