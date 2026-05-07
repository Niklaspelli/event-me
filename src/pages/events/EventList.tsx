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
import type { EventTypes } from "../../types/types";
import "./event-styling.css";

const EventList = ({ events }: { events: EventTypes[] }) => {
  const navigate = useNavigate();
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
                <Card.Body className="p-3 p-md-4">
                  {/* Vi använder d-flex utan flex-column för att tvinga rad-layout */}
                  <div className="d-flex align-items-start">
                    {/* DATUM-RUTA - Låst storlek för att inte tryckas ihop */}
                    <div
                      className="date-box d-flex flex-column align-items-center justify-content-center me-3 me-md-4 rounded-4 text-white shadow-sm"
                      style={{
                        minWidth: "65px", // Fast bredd
                        width: "65px",
                        height: "65px",
                        background:
                          "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                        lineHeight: "1",
                        flexShrink: 0, // Förhindrar att rutan krymper på små skärmar
                      }}
                    >
                      <span
                        className="text-uppercase fw-bold"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {eventDate
                          .toLocaleDateString("sv-SE", { month: "short" })
                          .replace(".", "")}
                      </span>
                      <span className="fs-3 fw-bold">
                        {eventDate.getDate()}
                      </span>
                    </div>

                    {/* INFO-DEL */}
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      {" "}
                      {/* minWidth: 0 behövs för att text-truncate ska fungera i flex */}
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <div className="text-truncate">
                          <Card.Title
                            className="fw-bold mb-1 text-dark text-truncate"
                            style={{ fontSize: "1.2rem" }}
                          >
                            {event.title}
                          </Card.Title>
                          <div className="d-flex flex-wrap gap-2 gap-md-3 text-muted small">
                            <span>
                              🕒{" "}
                              {eventDate.toLocaleTimeString("sv-SE", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {event.location && (
                              <span className="text-truncate">
                                📍 {event.location}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Badge - vi gör den lite mindre på mobil via CSS eller fast style */}
                        <Badge
                          className="d-none d-md-block rounded-pill ms-2 shadow-sm"
                          style={{
                            backgroundColor: "#077504",
                            fontSize: "0.75rem",
                            whiteSpace: "nowrap",
                            padding: "0.5em 1em",
                          }}
                        >
                          Kommande
                        </Badge>
                      </div>
                      {/* BESKRIVNING */}
                      <Card.Text
                        className="text-secondary mt-2 mb-3 text-truncate-2"
                        style={{
                          fontSize: "0.9rem",
                          lineHeight: "1.4",
                        }}
                      >
                        {event.description || "Ingen beskrivning tillgänglig."}
                      </Card.Text>
                      {/* FOOTER */}
                      <div className="d-flex justify-content-between align-items-center pt-2 border-top border-light">
                        <div className="small text-muted text-truncate me-2">
                          Av{" "}
                          <span className="fw-bold text-dark opacity-75">
                            {event.creatorName}
                          </span>
                        </div>
                        <Button
                          variant="link"
                          className="p-0 fw-bold text-decoration-none small"
                          style={{ color: "#4f46e5", whiteSpace: "nowrap" }}
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
