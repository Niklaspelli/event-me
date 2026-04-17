import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Button, Spinner, Badge } from "react-bootstrap";
import EventFeed from "./EventFeed";
import { useSingleEvent } from "../../hooks/useSingleEvent"; // Din nya hook
const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Vi använder hooken här!
  const { event, loading } = useSingleEvent(id);

  if (loading)
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );

  if (!event)
    return (
      <Container className="py-5 text-white">
        <h2>Hoppsan! Eventet verkar inte finnas kvar.</h2>
        <Button variant="primary" onClick={() => navigate("/events")}>
          Tillbaka till alla events
        </Button>
      </Container>
    );

  return (
    <Container className="py-4">
      <Button
        variant="link"
        className="text-white mb-3 p-0"
        onClick={() => navigate(-1)} // Går tillbaka till föregående sida
      >
        ← Tillbaka
      </Button>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h1 className="fw-bold mb-1">{event.title}</h1>
              <p className="text-muted">Skapat av {event.creatorName}</p>
            </div>
            <Badge bg="primary" className="px-3 py-2 rounded-pill">
              Kommande häng
            </Badge>
          </div>

          <hr />

          <div className="my-4">
            <h5 className="fw-bold">Beskrivning</h5>
            <p className="text-secondary" style={{ whiteSpace: "pre-wrap" }}>
              {event.description}
            </p>
          </div>
        </Card.Body>
      </Card>

      {/* Här visas nu väggen för just detta event */}
      <EventFeed eventId={id!} />
    </Container>
  );
};

export default EventDetails;
