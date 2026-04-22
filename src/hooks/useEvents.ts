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
  getDocs, // Behövs för att hämta nästa sida
  limit,
  orderBy,
  startAfter,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { useAuth } from "../Context/AuthContext";

export const useEvents = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); // Fixat namn här
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const { user } = useAuth() as any;

  // INITIAL HÄMTNING (De första 10)
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Ingen startAfter här, vi vill ha de första 10 från början
    const q = query(
      collectionGroup(db, "attendees"),
      where("uid", "==", user.uid),
      orderBy("datetime", "asc"),
      limit(10),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const lastVisible = snapshot.docs[snapshot.docs.length - 1];
        setLastDoc(lastVisible);

        const eventList = snapshot.docs.map((doc) => ({
          id: doc.ref.parent.parent?.id,
          ...doc.data(),
        }));
        setEvents(eventList);
      } else {
        setEvents([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // FUNKTION FÖR ATT LADDA NÄSTA 10
  const loadMore = async () => {
    if (!lastDoc || !user || loadingMore) return;

    setLoadingMore(true);

    try {
      const nextQ = query(
        collectionGroup(db, "attendees"),
        where("uid", "==", user.uid),
        orderBy("datetime", "asc"),
        startAfter(lastDoc),
        limit(10),
      );

      const snapshot = await getDocs(nextQ);

      if (!snapshot.empty) {
        const newLastDoc = snapshot.docs[snapshot.docs.length - 1];
        setLastDoc(newLastDoc);

        const nextEvents = snapshot.docs.map((doc) => ({
          id: doc.ref.parent.parent?.id,
          ...doc.data(),
        }));

        // VIKTIGT: Lägg till de nya i den gamla listan istället för att ersätta
        setEvents((prev) => [...prev, ...nextEvents]);
      }
    } catch (error) {
      console.error("Kunde inte ladda fler events:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  return { events, loading, loadMore, loadingMore };
};
