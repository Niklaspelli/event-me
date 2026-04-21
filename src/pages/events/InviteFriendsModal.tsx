import { useState, useEffect } from "react";

import {
  collection,
  query,
  getDocs,
  addDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { Button, ListGroup, Modal } from "react-bootstrap";

const InviteFriendsModal = ({ eventId, eventTitle, show, onHide }) => {
  const [friends, setFriends] = useState([]);
  const { user } = useAuth();

  // 1. Hämta din vänlista när modalen öppnas
  useEffect(() => {
    const fetchFriends = async () => {
      if (!user) return;
      const q = collection(db, "users", user.uid, "friends");
      const snap = await getDocs(q);
      setFriends(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    if (show) fetchFriends();
  }, [user, show]);

  // 2. Skicka inbjudan
  const sendInvite = async (friend) => {
    try {
      await addDoc(collection(db, "eventInvitations"), {
        eventId,
        eventTitle,
        fromId: user.uid,
        fromName: user.displayName,
        toId: friend.id,
        status: "pending",
        timestamp: serverTimestamp(),
      });
      alert(`Inbjudan skickad till ${friend.displayName}!`);
    } catch (err) {
      console.error("Kunde inte bjuda in:", err);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Bjud in vänner till {eventTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ListGroup variant="flush">
          {friends.map((friend) => (
            <ListGroup.Item
              key={friend.id}
              className="d-flex justify-content-between align-items-center"
            >
              {friend.displayName}
              <Button size="sm" onClick={() => sendInvite(friend)}>
                Bjud in
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>
    </Modal>
  );
};

export default InviteFriendsModal;
