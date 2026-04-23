import React, { useState } from "react";
import { ListGroup, Image, Button, Spinner } from "react-bootstrap";

interface UserItemProps {
  user: any;
  onSendRequest: (targetUser: any) => Promise<void>;
}

const UserSearchResultItem: React.FC<UserItemProps> = ({
  user,
  onSendRequest,
}) => {
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      await onSendRequest(user);
      setIsSent(true);
    } catch (error) {
      console.error("Kunde inte skicka:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ListGroup.Item className="bg-white border-light d-flex align-items-center justify-content-between p-3">
      <div className="d-flex align-items-center">
        <Image
          src={user.photoURL || "https://via.placeholder.com/50"}
          roundedCircle
          className="me-3"
          style={{ width: "50px", height: "50px", objectFit: "cover" }}
        />
        <div>
          <h6 className="mb-0 fw-bold text-dark">{user.displayName}</h6>
        </div>
      </div>

      <Button
        type="button" // Förhindrar Navbar-Enter krocken
        variant={isSent ? "success" : "outline-primary"}
        size="sm"
        className="rounded-pill px-3 fw-semibold"
        onClick={handleAction}
        disabled={isSent || loading}
      >
        {loading ? (
          <Spinner animation="border" size="sm" />
        ) : isSent ? (
          "Vänförfrågan skickad"
        ) : (
          "Lägg till vän"
        )}
      </Button>
    </ListGroup.Item>
  );
};

export default UserSearchResultItem;
