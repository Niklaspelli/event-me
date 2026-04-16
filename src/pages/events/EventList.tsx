import { useEvents } from "../../hooks/useEvents";
import { Card, Spinner, Container, Row, Col, Badge } from "react-bootstrap";
import EventFeed from "./EventFeed";

const EventList = () => {
  const { events, loading } = useEvents();
  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Hämtar häng...</p>
      </div>
    );
  }

  return (
    <Container>
      <Row>
        {events.length === 0 ? (
          <p className="text-center text-muted">
            Inga planerade häng än. Skapa ett!
          </p>
        ) : (
          events.map((event) => (
            <Col key={event.id} xs={12} className="mb-3">
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <Card.Title className="fw-bold fs-4 mb-1">
                        {event.title}
                      </Card.Title>
                      <Card.Subtitle className="text-muted mb-3 small">
                        Publicerat av {event.creatorName}
                      </Card.Subtitle>
                    </div>
                    <Badge bg="light" text="dark" className="border">
                      📅 Snart
                    </Badge>
                  </div>

                  <Card.Text className="text-secondary">
                    {event.description}
                  </Card.Text>

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-primary fw-semibold cursor-pointer">
                      Visa detaljer →
                    </small>
                    <div className="text-muted small">
                      {/* Här kan vi lägga till datum-formatering senare */}
                      id: {event.id.substring(0, 5)}...
                    </div>
                  </div>
                  <EventFeed />
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default EventList;
