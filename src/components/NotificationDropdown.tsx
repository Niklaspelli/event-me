import { useState, useEffect } from "react";

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { useAuth } from "../Context/AuthContext"; // Antar att du har din hook här

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const { currentUser } = useAuth(); // Eller din Auth-hook

  useEffect(() => {
    if (!currentUser) return;

    // Lyssna på förfrågningar till MIG som har status "pending"
    const q = query(
      collection(db, "friendRequests"),
      where("toId", "==", currentUser.uid),
      where("status", "==", "pending"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotifications(docs);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const acceptFriend = async (request) => {
    const batch = writeBatch(db);

    // 1. Lägg till i DIN vänlista (din befintliga logik)
    const myFriendRef = doc(
      db,
      "users",
      currentUser.uid,
      "friends",
      request.fromId,
    );
    batch.set(myFriendRef, {
      displayName: request.fromName,
      photoURL: request.fromPhoto,
      addedAt: serverTimestamp(),
    });

    // 2. Lägg till DIG i DERAS vänlista (så det blir ömsesidigt)
    const theirFriendRef = doc(
      db,
      "users",
      request.fromId,
      "friends",
      currentUser.uid,
    );
    batch.set(theirFriendRef, {
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
      addedAt: serverTimestamp(),
    });

    // 3. Ta bort förfrågan (notisen försvinner)
    const requestRef = doc(db, "friendRequests", request.id);
    batch.delete(requestRef);

    await batch.commit();
  };

  return (
    <div className="nav-item dropdown">
      {/* Här kan du visa en klock-ikon med en röd siffra: notifications.length */}
      {notifications.length > 0 && (
        <span className="badge bg-danger">{notifications.length}</span>
      )}
      {/* Lista notiserna i en dropdown... */}
    </div>
  );
};

export default NotificationDropdown;
