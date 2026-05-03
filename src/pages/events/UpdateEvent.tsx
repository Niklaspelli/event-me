import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Container, Form, Button, Spinner, Card } from "react-bootstrap";

const UpdateEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    datetime: "",
    location: "",
    city: "",
  });

  // 1. Hämta befintlig data när sidan laddas
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      const docRef = doc(db, "events", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          title: data.title || "",
          description: data.description || "",
          datetime: data.datetime || "",
          location: data.location || "",
          city: data.city || "",
        });
      }
      setLoading(false);
    };

    fetchEvent();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const eventRef = doc(db, "events", id);
      await updateDoc(eventRef, formData);
      navigate(`/events/event-details/${id}`);
    } catch (err) {
      console.error("Fel vid uppdatering:", err);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <Container className="py-4" style={{ maxWidth: "600px" }}>
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-4">
          <h2>Redigera Event</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Titel</Form.Label>
              <Form.Control
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <Form.Label className="fw-bold">Beskrivning</Form.Label>
              <Form.Control
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <Form.Label className="fw-bold">Tid & Datum</Form.Label>
              <Form.Control
                type="datetime-local"
                value={formData.datetime}
                onChange={(e) =>
                  setFormData({ ...formData, datetime: e.target.value })
                }
                required
                className="color-black"
                style={{
                  colorScheme: "light", // Tvingar webbläsaren att använda ljust tema för inputen
                }}
              />
            </Form.Group>

            {/* Upprepa för description, location, etc. */}

            <Button type="submit" variant="primary">
              Spara ändringar
            </Button>
            <Button variant="link" onClick={() => navigate(-1)}>
              Avbryt
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UpdateEvent;
