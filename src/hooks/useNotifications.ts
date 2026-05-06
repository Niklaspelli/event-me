// hooks/useNotifications.ts
import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

export const useNotifications = (userId: string | undefined) => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Lyssna på generella notiser (Feed/Inställt)
    const qGeneral = query(
      collection(db, "notifications"),
      where("toId", "==", userId),
      where("isRead", "==", false),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(qGeneral, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        category: "general",
      }));
      setNotifications(data);
    });

    return () => unsubscribe();
  }, [userId]);

  return notifications;
};
