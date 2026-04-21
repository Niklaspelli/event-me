import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  Spinner,
  Badge,
  Row,
  Col,
} from "react-bootstrap";
import EventFeed from "./EventFeed";
import { useSingleEvent } from "../../hooks/useSingleEvent"; // Din nya hook
import AttendeeList from "./AttendeeList";
import InviteModal from "./InviteModal";
import { useState } from "react";
import GoogleCalendarButton from "./GoogleCalendarButton";
import EventMap from "./EventMap";
import "./event-styling.css";

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showInvite, setShowInvite] = useState(false);
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
    <Container className="py-4 px-3 px-md-0">
      {/* Tillbaka-knapp med snyggare hover-känsla */}

      {/* HUVUDKORT: Event-info */}
      <Card className="border-0 shadow-lg rounded-4 overflow-hidden mb-4 bg-white">
        <Card.Body className="p-4">
          {/* Header: Titel och Status */}
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div className="pe-3">
              <h1 className="display-6 fw-bold mb-2 text-dark">
                {event.title}
              </h1>
              <div className="d-flex flex-wrap gap-3 align-items-center text-secondary">
                <div className="d-flex align-items-center">
                  <span className="me-2">📅</span>
                  <span>
                    {new Date(event.datetime).toLocaleDateString("sv-SE", {
                      weekday: "long",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <div className="d-flex align-items-center">
                  <span className="me-2">🕒</span>
                  <span>
                    Kl.{" "}
                    {new Date(event.datetime).toLocaleTimeString("sv-SE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <Badge bg="primary" className="px-3 py-2 rounded-pill shadow-sm">
              Kommande
            </Badge>
          </div>

          <hr className="opacity-10" />

          {/* Innehåll: Beskrivning och Karta */}
          <Row className="g-4 my-2">
            <Col lg={7}>
              <div className="mb-4">
                <h5 className="fw-bold text-dark mb-3">Om eventet</h5>
                <p
                  className="text-muted leading-relaxed"
                  style={{ whiteSpace: "pre-wrap", fontSize: "1.05rem" }}
                >
                  {event.description ||
                    "Ingen beskrivning tillagd för detta event."}
                </p>
              </div>

              <div className="d-flex flex-column flex-sm-row gap-2">
                <GoogleCalendarButton event={event} />
                <Button
                  variant="light"
                  className="rounded-pill btn-sm fw-bold border"
                  onClick={() => {
                    /* Logik för att dela? */
                  }}
                >
                  🔗 Dela event
                </Button>
              </div>
            </Col>

            <Col lg={5}>
              <div className="p-3 bg-light rounded-4 border border-1">
                <EventMap location={event.location} />
                <div className="mt-2 text-center">
                  <small className="text-muted">
                    Skapat av{" "}
                    <span className="fw-bold">{event.creatorName}</span>
                  </small>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Button
        variant="link"
        className="text-white text-decoration-none mb-3 p-0 opacity-75 hover-opacity-100"
        onClick={() => navigate(-1)}
      >
        <span className="me-2">←</span> Tillbaka
      </Button>
      {/* SEKUNDÄRT KORT: Deltagare och Inbjudan */}
      <Row className="g-4">
        <Col md={5} lg={4}>
          <Card className="shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
            <h5 className="fw-bold mb-4 d-flex justify-content-between align-items-center">
              Deltagare
              <Badge bg="light" text="dark" className="border">
                {/* Antal deltagare här? */}
              </Badge>
            </h5>

            <Button
              variant="primary"
              className="w-100 mb-4 rounded-pill fw-bold py-2 shadow-sm"
              onClick={() => setShowInvite(true)}
            >
              + Bjud in vänner
            </Button>

            <AttendeeList eventId={id!} />

            <InviteModal
              show={showInvite}
              onHide={() => setShowInvite(false)}
              eventId={id!}
              eventTitle={event.title}
            />
          </Card>
        </Col>

        {/* VÄGG / FEED */}
        <Col md={7} lg={8}>
          <Card className="shadow-sm border-0 rounded-4 p-4 bg-white">
            <EventFeed eventId={id!} />
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EventDetails;
