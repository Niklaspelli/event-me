// hooks/useEventPosts.ts
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export const useEventPosts = (eventId: string) => {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!eventId) return;
    const q = query(
      collection(db, "events", eventId, "posts"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [eventId]);

  return posts;
};
