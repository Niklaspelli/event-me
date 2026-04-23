import { useState, useEffect } from "react";
import { db } from "../../firebase"; // Se till att db är importerad
import { useAuth } from "../../Context/AuthContext";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { Button, ListGroup, Modal } from "react-bootstrap";

const InviteFriendsModal = ({
  eventId,
  eventTitle,
  eventDate,
  show,
  onHide,
}) => {
  const [friends, setFriends] = useState([]);
  const [invitedIds, setInvitedIds] = useState(new Set()); // Håller koll på vilka som redan är bjudna
  const { user } = useAuth() as any;

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !show) return;

      try {
        // 1. Hämta din vänlista
        const friendsQ = collection(db, "users", user.uid, "friends");
        const friendsSnap = await getDocs(friendsQ);
        const friendsList = friendsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFriends(friendsList);

        // 2. Hämta befintliga inbjudningar för detta event
        const invitesQ = query(
          collection(db, "eventInvitations"),
          where("eventId", "==", eventId),
        );
        const invitesSnap = await getDocs(invitesQ);

        // Spara alla toId i ett Set för snabb uppslagning
        const alreadyInvited = new Set(
          invitesSnap.docs.map((doc) => doc.data().toId),
        );
        setInvitedIds(alreadyInvited);
      } catch (err) {
        console.error("Fel vid hämtning:", err);
      }
    };

    fetchData();
  }, [user, show, eventId]);

  const sendInvite = async (friend: any) => {
    try {
      await addDoc(collection(db, "eventInvitations"), {
        eventId,
        eventTitle,
        eventDate,
        fromId: user.uid,
        fromName: user.displayName,
        toId: friend.id,
        status: "pending",
        timestamp: serverTimestamp(),
      });

      // Uppdatera state lokalt så knappen ändras direkt utan omladdning
      setInvitedIds((prev) => new Set(prev).add(friend.id));
    } catch (err) {
      console.error("Kunde inte bjuda in:", err);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Bjud in vänner</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ListGroup variant="flush">
          {friends.map((friend: any) => {
            const isInvited = invitedIds.has(friend.id);

            return (
              <ListGroup.Item
                key={friend.id}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <span className="fw-bold">{friend.displayName}</span>
                </div>

                <Button
                  size="sm"
                  variant={isInvited ? "outline-secondary" : "primary"}
                  onClick={() => sendInvite(friend)}
                  disabled={isInvited}
                >
                  {isInvited ? "Inbjuden" : "Bjud in"}
                </Button>
              </ListGroup.Item>
            );
          })}
          {friends.length === 0 && (
            <p className="text-center text-muted">Inga vänner hittades.</p>
          )}
        </ListGroup>
      </Modal.Body>
    </Modal>
  );
};

export default InviteFriendsModal;
