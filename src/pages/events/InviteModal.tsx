import React, { useState, useEffect } from "react";
import { Modal, Button, ListGroup, Image, Spinner } from "react-bootstrap";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../Context/AuthContext";
import { sendEventInvitations } from "../../services/inviteService";
import { type InviteModalTypes } from "../../types/types";

/* interface InviteModalProps {
  show: boolean;
  onHide: () => void;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  createdBy: string; // Viktigt: skickas från föräldern
} */

const InviteModal: React.FC<InviteModalTypes> = ({
  show,
  onHide,
  eventId,
  eventTitle,
  eventDate,
  createdBy,
}) => {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const { user } = useAuth() as any;

  useEffect(() => {
    if (show && user) {
      const fetchFriendsAndInvites = async () => {
        setLoading(true);
        try {
          // 1. Hämta redan skickade inbjudningar
          const invitesQ = query(
            collection(db, "eventInvitations"),
            where("eventId", "==", eventId),
          );
          const invitesSnap = await getDocs(invitesQ);
          const alreadyInvited = invitesSnap.docs.map((doc) => doc.data().toId);
          setInvitedIds(alreadyInvited);

          // 2. Hämta vänner
          const friendsSnap = await getDocs(
            collection(db, "users", user.uid, "friends"),
          );

          // 3. Filtrera bort inloggad användare, skaparen och redan inbjudna
          const friendsList = friendsSnap.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((friend: any) => {
              const friendId = friend.id;

              const isMe = friendId === user.uid;
              const isCreator = friendId === createdBy; // Jämför mot skapar-ID
              const isAlreadyInvited = alreadyInvited.includes(friendId);

              // Returnera endast de som inte matchar något av ovanstående
              return !isMe && !isCreator && !isAlreadyInvited;
            });

          setFriends(friendsList);
        } catch (error) {
          console.error("Error fetching friends:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchFriendsAndInvites();
    }
  }, [show, user, eventId, createdBy]); // <--- Glöm inte createdBy här!

  const handleInvite = async (friend: any) => {
    try {
      await sendEventInvitations(
        [friend],
        eventId,
        eventTitle,
        eventDate,
        user,
      );

      // Ta bort vännen från listan direkt för bättre UX
      setFriends((prev) => prev.filter((f) => f.id !== friend.id));
      setInvitedIds((prev) => [...prev, friend.id]);
    } catch (err) {
      alert("Kunde inte skicka inbjudan.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered scrollable>
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold small text-uppercase">
          Bjud in vänner
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0">
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" size="sm" />
          </div>
        ) : (
          <ListGroup variant="flush">
            {friends.length > 0 ? (
              friends.map((friend) => (
                <ListGroup.Item
                  key={friend.id}
                  className="d-flex align-items-center justify-content-between px-0 py-3"
                >
                  <div className="d-flex align-items-center">
                    <Image
                      src={friend.photoURL || "/default-avatar.png"}
                      roundedCircle
                      width={40}
                      height={40}
                      className="me-3"
                      style={{ objectFit: "cover" }}
                    />
                    <span className="fw-semibold text-dark">
                      {friend.displayName}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => handleInvite(friend)}
                    className="rounded-pill px-3"
                  >
                    Bjud in
                  </Button>
                </ListGroup.Item>
              ))
            ) : (
              <div className="text-center p-4 text-muted">
                Inga vänner tillgängliga att bjuda in.
              </div>
            )}
          </ListGroup>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default InviteModal;
