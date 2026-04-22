import { useState, useEffect } from "react";
import { updateEmail, updateProfile, deleteUser } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, deleteDoc, getDoc } from "firebase/firestore";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import ConfirmDialog from "../components/ConfirmDialog";

const ProfileSettings = () => {
  const user = auth.currentUser;
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // 1. Hämta dokumentet från Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));

        if (userDoc.exists()) {
          const data = userDoc.data();
          // 2. Sätt bilden från Firestore-länken (den med token!)
          setPhotoURL(data.photoURL || "");
          setDisplayName(data.displayName || "");
        }
      }
    };

    fetchUserData();
  }, []);

  // 2. Uppdatera din gamla funktion
  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      // 1. Spara referensen innan vi börjar
      const userDocRef = doc(db, "users", user.uid);

      // 2. RADERA I FIRESTORE FÖRST
      // Vi väntar (await) tills dokumentet är bekräftat raderat
      await deleteDoc(userDocRef);
      console.log("Firestore-dokument raderat");

      // 3. RADERA AUTH-KONTOT
      // Nu kan vi radera inloggningen
      await deleteUser(user);
      console.log("Auth-konto raderat");

      // 4. LOGGA UT OCH SKICKA IVÄG
      // Använd window.location.replace för att tömma historiken
      window.location.replace("/login?status=deleted");
    } catch (err: any) {
      setIsDeleting(false);
      setShowDeleteModal(false);

      if (err.code === "auth/requires-recent-login") {
        setMessage({
          type: "danger",
          text: "Säkerhetsspärr: Logga ut och in igen, försök sedan radera på nytt.",
        });
      } else {
        console.error("Raderingsfel:", err);
        setMessage({
          type: "danger",
          text: "Kunde inte radera: " + err.message,
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

              {/* Knappen triggar bara modalen */}
              <Button
                variant="outline-danger"
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
              >
                <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
                {isDeleting ? "Raderar..." : "Radera konto"}
              </Button>

              {/* Modalen ligger utanför knapp-logiken men styrs av showDeleteModal */}
              <ConfirmDialog
                show={showDeleteModal}
                onCancel={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteAccount} // Denna kör den faktiska raderingen
                isLoading={isDeleting}
                title="Radera konto permanent"
                message="Är du helt säker? All din data, dina skapade events och din profil kommer att försvinna."
              />
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProfileSettings;
