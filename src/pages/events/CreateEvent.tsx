import { useState } from "react";
import { Form, Button, Card, Container, Alert } from "react-bootstrap";
import { useAuth } from "../../Context/AuthContext";
import { createNewEvent } from "../../services/eventService";

const CreateEvent = () => {
  // Typa user snyggt (eller låt AuthContext sköta det om du har en interface där)
  const { user } = useAuth() as {
    user: { uid: string; displayName: string } | null;
  };

  // States för formuläret
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  // States för UI-feedback
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage(""); // Rensa tidigare meddelanden

    try {
      // Skicka med de faktiska state-värdena från formuläret!
      await createNewEvent({
        title: title, // Använder värdet från input-fältet
        description: description, // Använder värdet från textarea
        location,
        datetime: date,
        createdBy: user.uid,
        creatorName: user.displayName,
      });

      setMessage("Eventet har publicerats! 🎉");
      setTitle(""); // Rensa fälten efter lyckad sparning
      setDescription("");
    } catch (error) {
      console.error(error);
      setMessage("Hoppsan, något gick fel. Försök igen!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-4">
          <h2 className="fw-bold mb-4">Skapa nytt häng</h2>

          {message && (
            <Alert
              variant={message.includes("fel") ? "danger" : "success"}
              dismissible
              onClose={() => setMessage("")}
            >
              {message}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Vad ska hända?</Form.Label>
              <Form.Control
                type="text"
                placeholder="t.ex. Spontan AW på Möllan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="py-2 bg-light border-0"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Var ska vi vara?</Form.Label>
              <Form.Control
                className="py-2 bg-light border-0"
                type="text"
                placeholder="Ex: Restaurang Sjön, eller hemma hos mig"
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>När börjar det?</Form.Label>
              <Form.Control
                className="py-2 bg-light border-0"
                type="datetime-local"
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Beskrivning</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Berätta lite mer om tid, plats eller vad folk ska ta med..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="py-2 bg-light border-0"
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              disabled={loading || !title}
              className="w-100 py-2 fw-bold mt-2 rounded-pill"
            >
              {loading ? "Sparar..." : "Publicera Event"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateEvent;
