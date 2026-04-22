/* import { Card, Container, Row, Col, Badge, Button } from "react-bootstrap";
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
                    <Card.Text className="text-secondary opacity-75">
                      {new Date(event.datetime).toLocaleDateString("sv-SE", {
                        weekday: "long",
                        day: "numeric",
                        month: "short",
                      })}
                      🕒 Kl.{" "}
                      {new Date(event.datetime).toLocaleTimeString("sv-SE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Card.Text>
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
 */

import { Card, Container, Row, Col, Badge, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import type { AppEvent } from "../../types/types";
import "./event-styling.css";

const EventList = ({ events }: { events: AppEvent[] }) => {
  const navigate = useNavigate();
  console.log("events", events);
  return (
    <Container className="p-0">
      <Row>
        {events.map((event) => {
          const eventDate = new Date(event.datetime);

          return (
            <Col key={event.id} xs={12} className="mb-3">
              <Card
                className="border-0 shadow-sm rounded-4 overflow-hidden bg-white text-dark event-main-card"
                style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                onClick={() => navigate(`/events/event-details/${event.id}`)}
              >
                <Card.Body className="p-4">
                  <div className="d-flex align-items-start">
                    {/* DATUM-RUTA - Nu med ännu klarare färger */}
                    <div
                      className="date-box d-flex flex-column align-items-center justify-content-center me-4 rounded-4 text-white shadow"
                      style={{
                        minWidth: "70px",
                        height: "70px",
                        background:
                          "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", // Indigo till Blå
                        lineHeight: "1.1",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                          fontWeight: "bold",
                        }}
                      >
                        {eventDate.toLocaleDateString("sv-SE", {
                          month: "short",
                        })}
                      </span>
                      <span style={{ fontSize: "1.6rem", fontWeight: "bold" }}>
                        {eventDate.getDate()}
                      </span>
                    </div>

                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <Card.Title className="fw-bold fs-4 mb-1 text-dark">
                            {event.title}
                          </Card.Title>
                          <div className="d-flex flex-wrap gap-3 text-muted small">
                            <span>
                              🕒 Kl.{" "}
                              {eventDate.toLocaleTimeString("sv-SE", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {event.location && <span>📍 {event.location}</span>}
                          </div>
                        </div>
                        <Badge
                          bg="primary"
                          className="px-3 py-2 rounded-pill shadow-sm"
                          style={{ backgroundColor: "#4f46e5" }}
                        >
                          Kommande
                        </Badge>
                      </div>

                      <Card.Text
                        className="text-secondary mt-3 mb-3 text-truncate-2"
                        style={{ color: "#64748b !important" }}
                      >
                        {event.description || "Ingen beskrivning tillgänglig."}
                      </Card.Text>

                      <div className="d-flex justify-content-between align-items-center pt-3 border-top border-light">
                        <div className="small text-muted">
                          Skapat av{" "}
                          <span className="fw-bold text-dark opacity-75">
                            {event.creatorName}
                          </span>
                        </div>
                        <Button
                          variant="link"
                          className="p-0 fw-bold text-decoration-none"
                          style={{ color: "#4f46e5" }}
                        >
                          Visa detaljer →
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default EventList;
