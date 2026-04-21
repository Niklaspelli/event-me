import React, { useState, useEffect } from "react";
import { Modal, Button, ListGroup, Image, Spinner } from "react-bootstrap";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../Context/AuthContext";
import { sendEventInvitations } from "../../services/inviteService";

interface InviteModalProps {
  show: boolean;
  onHide: () => void;
  eventId: string;
  eventTitle: string;
}

const InviteModal: React.FC<InviteModalProps> = ({
  show,
  onHide,
  eventId,
  eventTitle,
}) => {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const { user } = useAuth() as any;

  useEffect(() => {
    if (show && user) {
      const fetchFriends = async () => {
        setLoading(true);
        const snap = await getDocs(
          collection(db, "users", user.uid, "friends"),
        );
        setFriends(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      };
      fetchFriends();
    }
  }, [show, user]);

  const handleInvite = async (friend: any) => {
    try {
      await sendEventInvitations([friend], eventId, eventTitle, user);
      setInvitedIds([...invitedIds, friend.id]); // Markera som inbjuden i UI
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
            {friends.map((friend) => (
              <ListGroup.Item
                key={friend.id}
                className="d-flex align-items-center justify-content-between px-0 py-3"
              >
                <div className="d-flex align-items-center">
                  <Image
                    src={friend.photoURL || "https://via.placeholder.com/40"}
                    roundedCircle
                    width={40}
                    className="me-3"
                  />
                  <span className="fw-semibold">{friend.displayName}</span>
                </div>
                <Button
                  size="sm"
                  variant={
                    invitedIds.includes(friend.id)
                      ? "success"
                      : "outline-primary"
                  }
                  disabled={invitedIds.includes(friend.id)}
                  onClick={() => handleInvite(friend)}
                  className="rounded-pill px-3"
                >
                  {invitedIds.includes(friend.id) ? "Inbjuden" : "Bjud in"}
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default InviteModal;
