import { useState } from "react";
import { updateEmail, updateProfile, deleteUser } from "firebase/auth";
import { auth } from "../firebase";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const ProfileSettings = () => {
  const user = auth.currentUser;
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateProfile(user, { displayName, photoURL });
      if (newEmail !== user.email) {
        await updateEmail(user, newEmail);
      }
      setMessage({ type: "success", text: "Profilen har uppdaterats!" });
    } catch (err: any) {
      setMessage({ type: "danger", text: err.message });
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Är du säker på att du vill radera ditt konto? Detta går inte att ångra.",
      )
    ) {
      try {
        await deleteUser(user!);
        // Navigera till start
      } catch (err: any) {
        setMessage({
          type: "danger",
          text: "Du måste logga in på nytt för att radera kontot.",
        });
      }
    }
  };

  return (
    <Container className="py-5">
      <Card
        className="bg-dark text-white border-secondary mx-auto"
        style={{ maxWidth: "600px", borderRadius: "15px" }}
      >
        <Card.Body className="p-4">
          <h3 className="mb-4 text-center">Inställningar</h3>
          {message.text && <Alert variant={message.type}>{message.text}</Alert>}

          <Form onSubmit={handleUpdate}>
            <Form.Group className="mb-3">
              <Form.Label>Profilbild (URL)</Form.Label>
              <Form.Control
                className="bg-dark text-white border-secondary"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Visningsnamn</Form.Label>
              <Form.Control
                className="bg-dark text-white border-secondary"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>E-postadress</Form.Label>
              <Form.Control
                type="email"
                className="bg-dark text-white border-secondary"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </Form.Group>

            <div className="d-grid gap-2">
              <Button variant="primary" type="submit">
                Spara ändringar
              </Button>
              <hr className="my-4 border-secondary" />
              <Button variant="outline-danger" onClick={handleDeleteAccount}>
                <FontAwesomeIcon icon={faTrashAlt} className="me-2" /> Radera
                konto
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProfileSettings;
