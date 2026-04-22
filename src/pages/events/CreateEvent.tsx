import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Card,
  Container,
  Alert,
  ListGroup,
  Image,
} from "react-bootstrap";
import { useAuth } from "../../Context/AuthContext";
import { createNewEvent } from "../../services/eventService";
import { sendEventInvitations } from "../../services/inviteService";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";

const CreateEvent = () => {
  const { user } = useAuth() as any;
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");

  // Vän-states
  const [myFriends, setMyFriends] = useState<any[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Hämta vänner för inbjudningslistan
  useEffect(() => {
    const fetchFriends = async () => {
      if (!user) return;
      try {
        const snap = await getDocs(
          collection(db, "users", user.uid, "friends"),
        );
        setMyFriends(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Kunde inte hämta vänner:", err);
      }
    };
    fetchFriends();
  }, [user]);

  const toggleFriend = (friend: any) => {
    if (selectedFriends.find((f) => f.id === friend.id)) {
      setSelectedFriends(selectedFriends.filter((f) => f.id !== friend.id));
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage("");

    try {
      // 1. Skapa eventet via service
      const createdEventId = await createNewEvent({
        title,
        description,
        location,
        datetime: date,
        createdBy: user.uid,
        creatorName: user.displayName || "Anonym",
        createdAt: undefined,
        attendees: [],
        photoURL: "",
      });

      // --- NYTT: Lägg till skaparen som deltagare med datetime och title ---
      // Detta gör att eventet dyker upp i "Dina Events" direkt!
      await setDoc(doc(db, "events", createdEventId, "attendees", user.uid), {
        uid: user.uid,
        displayName: user.displayName || "Anonym",
        photoURL: user.photoURL || "",
        status: "going",
        datetime: date, // VIKTIGT för sortering i EventView
        title: title, // VIKTIGT för rendering i EventList
        joinedAt: serverTimestamp(),
      });

      // 2. Skicka inbjudningar om vänner är valda
      if (selectedFriends.length > 0) {
        await sendEventInvitations(
          selectedFriends,
          createdEventId,
          title,
          date,
          user,
        );
      }

      setMessage("Hänget är skapat och vännerna är inbjudna! 🎉");

      // Valfritt: Skicka användaren till det nya eventet efter 2 sekunder
      setTimeout(
        () => navigate(`/events/event-details/${createdEventId}`),
        2000,
      );
    } catch (error) {
      console.error(error);
      setMessage("Något gick fel vid sparning.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4" style={{ maxWidth: "600px" }}>
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-4">
          <h2 className="fw-bold mb-4 text-center">Skapa nytt häng</h2>

          {message && (
            <Alert variant={message.includes("fel") ? "danger" : "success"}>
              {message}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Titel</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Vad ska vi hitta på?"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Plats</Form.Label>
              <Form.Control
                type="text"
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder="Var ses vi?"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Beskrivning</Form.Label>
              <Form.Control
                type="text"
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Vad ska vi hitta på?"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Tid & Datum</Form.Label>
              <Form.Control
                type="datetime-local"
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">
                Bjud in vänner (valfritt)
              </Form.Label>
              <div
                className="border rounded p-2"
                style={{ maxHeight: "200px", overflowY: "auto" }}
              >
                {myFriends.length === 0 ? (
                  <p className="text-muted small p-2">
                    Du har inga vänner i din lista än.
                  </p>
                ) : (
                  myFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className="d-flex align-items-center p-2 border-bottom last-child-0"
                    >
                      <Form.Check
                        type="checkbox"
                        id={`check-${friend.id}`}
                        onChange={() => toggleFriend(friend)}
                        checked={selectedFriends.some(
                          (f) => f.id === friend.id,
                        )}
                        className="me-2"
                      />
                      <Image
                        src={
                          friend.photoURL || "https://via.placeholder.com/30"
                        }
                        roundedCircle
                        width={30}
                        className="me-2"
                      />
                      <label
                        htmlFor={`check-${friend.id}`}
                        className="small m-0 cursor-pointer"
                      >
                        {friend.displayName}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 fw-bold rounded-pill"
              disabled={loading}
            >
              {loading ? "Publicerar..." : "Skapa & Bjud in"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateEvent;
