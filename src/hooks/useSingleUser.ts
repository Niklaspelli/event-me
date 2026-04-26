import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import type { UserProfile } from "../types/types";

export const useSingleUser = (uid: string | undefined) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    // Vi skapar en lyssnare på just detta dokument
    const docRef = doc(db, "users", uid);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setUser({ uid: docSnap.uid, ...docSnap.data() } as UserProfile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  return { user, loading };
};
