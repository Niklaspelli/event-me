import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Card,
  Container,
  Alert,
  Collapse,
  Image,
} from "react-bootstrap";
import { ChevronDown, ChevronUp, People } from "react-bootstrap-icons";
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
  const [open, setOpen] = useState(false);
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
      // Vi skickar med ALLT här så att servicen kan spara det i huvud-dokumentet
      const createdEventId = await createNewEvent({
        title: title,
        description: description,
        location: location,
        datetime: date,
        createdBy: user.uid,
        creatorName: user.displayName || "Användare",
        photoURL: user.photoURL || "",
        attendees: [], // Initialt tom
        createdAt: undefined, // Sätts av serverTimestamp i servicen
      });

      // --- TA BORT det manuella setDoc-anropet här! ---
      // Din createNewEvent i eventService.ts skapar redan din attendee-post.
      // Om du gör det här igen riskerar du att skriva över data med felaktiga fält.

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

      setTimeout(
        () => navigate(`/events/event-details/${createdEventId}`),
        2000,
      );
    } catch (error) {
      console.error("Fel vid skapande:", error);
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
                as="textarea"
                value={description}
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
              {/* Label och knapp i en rad */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="fw-bold mb-0">
                  Bjud in vänner (valfritt)
                </Form.Label>
                <Button
                  onClick={() => setOpen(!open)}
                  aria-controls="friend-list-collapse"
                  aria-expanded={open}
                  variant="outline-primary"
                  size="sm"
                  className="rounded-pill px-3 d-flex align-items-center gap-2"
                >
                  {open ? <ChevronUp /> : <ChevronDown />}
                  {selectedFriends.length > 0
                    ? `${selectedFriends.length} valda`
                    : "Visa lista"}
                </Button>
              </div>

              <Collapse in={open}>
                <div id="friend-list-collapse">
                  <div
                    className="border rounded-3 shadow-sm bg-light"
                    style={{ maxHeight: "250px", overflowY: "auto" }}
                  >
                    {myFriends.length === 0 ? (
                      <div className="text-center p-4">
                        <People
                          size={32}
                          className="text-muted mb-2 opacity-50"
                        />
                        <p className="text-muted small mb-0">
                          Du har inga vänner i din lista än.
                        </p>
                      </div>
                    ) : (
                      myFriends.map((friend) => (
                        <div
                          key={friend.id}
                          className="d-flex align-items-center p-2 border-bottom last-child-0 hover-bg-white transition-all"
                          style={{ cursor: "pointer" }}
                          onClick={() => toggleFriend(friend)} // Gör hela raden klickbar
                        >
                          <Form.Check
                            type="checkbox"
                            id={`check-${friend.id}`}
                            onChange={() => {}} // Hanteras av div-klicket
                            checked={selectedFriends.some(
                              (f) => f.id === friend.id,
                            )}
                            className="ms-2 me-3 custom-checkbox"
                          />
                          <Image
                            src={
                              friend.photoURL ||
                              "https://via.placeholder.com/30"
                            }
                            roundedCircle
                            width={32}
                            height={32}
                            className="me-3 object-fit-cover shadow-sm"
                          />
                          <span className="small fw-medium text-dark">
                            {friend.displayName}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Collapse>
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
