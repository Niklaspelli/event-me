import { Card, Container, Row, Col, Badge, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import type { AppEvent } from "../../types/types";

const EventList = ({ events }: { events: AppEvent[] }) => {
  const navigate = useNavigate();

  return (
    <Container className="p-0">
      <Row>
        {events.map((event) => (
          <Col key={event.id} xs={12} className="mb-3">
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-dark text-white border border-secondary">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <Card.Title className="fw-bold fs-4 mb-1">
                      {event.title}
                    </Card.Title>
                    <Card.Subtitle className="text-muted small">
                      Skapat av {event.creatorName}
                    </Card.Subtitle>
                  </div>
                  <Badge bg="primary" className="px-3 py-2 rounded-pill">
                    Kommande
                  </Badge>
                </div>

                <Card.Text className="text-secondary opacity-75">
                  {event.description}
                </Card.Text>

                <div className="d-flex justify-content-between align-items-center pt-3 border-top border-secondary">
                  <Button
                    variant="link"
                    className="p-0 text-primary fw-bold text-decoration-none"
                    onClick={() =>
                      navigate(`/events/event-details/${event.id}`)
                    }
                  >
                    Visa detaljer →
                  </Button>
                  <small className="text-muted">
                    ID: {event.id?.substring(0, 5) ?? ""}
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default EventList;
