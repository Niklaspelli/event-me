import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

// Vi skickar in eventId som ett argument
export const usePosts = (eventId: string | undefined) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Om vi inte har ett eventId (t.ex. om sidan laddas fel), avbryt
    if (!eventId) return;

    // VIKTIGT: Vi hämtar nu från sub-collectionen 'posts' inuti det specifika eventet
    const postsRef = collection(db, "events", eventId, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(data);
        setLoading(false);
      },
      (err) => {
        console.error("Fel vid hämtning av inlägg:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [eventId]); // Kör om ifall vi byter event

  return { posts, loading, error };
};