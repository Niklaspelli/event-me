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
import { useAuth } from "../Context/AuthContext";
import type { AppEvent } from "../types/types";

export const useEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Om ingen är inloggad, kör inte queryn
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    // 1. Skapa en referens till kollektionen
    const eventsRef = collection(db, "events");

    // 2. Skapa en query som bara hämtar inloggad användares events
    const q = query(
      eventsRef,
      where("createdBy", "==", user.uid), // <--- VIKTIGT: Filtrera på UID
      orderBy("createdAt", "asc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const eventList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AppEvent[];

        setEvents(eventList);
        setLoading(false);
      },
      (error) => {
        console.error("Fel vid hämtning:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]); // Kör om när användaren ändras

  return { events, loading };
};
