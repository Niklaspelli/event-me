// src/hooks/useEvents.ts
import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore";

export const useEvents = (userId?: string) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, "events"), orderBy("createdAt", "desc"));

    // Om vi skickar med ett userId, filtrera så vi bara ser skaparens event
    if (userId) {
      q = query(
        collection(db, "events"),
        where("createdBy", "==", userId),
        orderBy("createdAt", "desc"),
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { events, loading };
};
