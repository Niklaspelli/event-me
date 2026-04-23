import { useParams, useNavigate, useLocation } from "react-router-dom";
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
import { useSingleEvent } from "../../hooks/useSingleEvent";
import AttendeeList from "./AttendeeList";
import InviteModal from "./InviteModal";
import { useState, useEffect } from "react";
import GoogleCalendarButton from "./GoogleCalendarButton";
import EventMap from "./EventMap";
import "./event-styling.css";
import { onSnapshot, doc, query, collection, where } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../Context/AuthContext";
import EventJoinPreview from "./EventJoinPreview";
import DeleteEventButton from "./DeleteEventButton";

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // För att veta var vi är vid redirect till login

  const [showInvite, setShowInvite] = useState(false);
  const [isAttendee, setIsAttendee] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const { event, loading } = useSingleEvent(id);
  const [currentInvite, setCurrentInvite] = useState<any>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);

  // 1. Kolla deltagarstatus
  useEffect(() => {
    // Om ingen är inloggad, sätt status direkt
    if (!user) {
      setIsAttendee(false);
      setCheckingStatus(false);
      return;
    }

    if (!id) return;

    const attendeeRef = doc(db, "events", id, "attendees", user.uid);
    const unsubscribe = onSnapshot(
      attendeeRef,
      (docSnap) => {
        setIsAttendee(docSnap.exists());
        setCheckingStatus(false);
      },
      (err) => {
        console.error("Rules check:", err);
        setCheckingStatus(false);
      },
    );

    return () => unsubscribe();
  }, [id, user]);

  // 2. Kolla efter inbjudan (endast om inloggad)
  useEffect(() => {
    if (!user || !id || isAttendee) {
      setLoadingInvite(false);
      return;
    }

    const q = query(
      collection(db, "eventInvitations"),
      where("eventId", "==", id),
      where("toId", "==", user.uid),
      where("status", "==", "pending"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setCurrentInvite({
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
        });
      } else {
        setCurrentInvite(null);
      }
      setLoadingInvite(false);
    });

    return () => unsubscribe();
  }, [id, user, isAttendee]);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!event) {
    return (
      <Container className="py-5 text-white">
        <h2>Hoppsan! Eventet verkar inte finnas kvar.</h2>
        <Button variant="primary" onClick={() => navigate("/events")}>
          Tillbaka till alla events
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4 px-3 px-md-0">
      <Button
        variant="link"
        className="text-black text-decoration-none mb-3 p-0 opacity-75"
        onClick={() => navigate(-1)}
      >
        <span className="me-2">←</span> Tillbaka
      </Button>

      {/* HUVUDKORT */}
      <Card className="border-0 shadow-lg rounded-4 overflow-hidden mb-4 bg-white">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div className="pe-3">
              <h1 className="display-6 fw-bold mb-2 text-dark">
                {event.title}
              </h1>
              <div className="d-flex flex-wrap gap-3 align-items-center text-secondary">
                <div>
                  📅{" "}
                  {new Date(event.datetime).toLocaleDateString("sv-SE", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                  })}
                </div>
                <div>
                  🕒 Kl.{" "}
                  {new Date(event.datetime).toLocaleTimeString("sv-SE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>{" "}
            <div className="d-flex flex-column flex-md-column align-items-start gap-2 mt-3">
              {/* Badge - w-auto ser till att den bara är så bred som texten */}
              <Badge
                bg="primary"
                className="px-3 py-2 rounded-pill shadow-sm w-auto"
              >
                Kommande
              </Badge>

              {/* Google-knappen - omsluten av w-auto för säkerhets skull */}
              <div className="w-auto">
                <GoogleCalendarButton event={event} />
              </div>
            </div>
          </div>

          <hr className="opacity-10" />

          <Row className="g-4 my-2">
            <Row className="g-4 my-2">
              <Col lg={7}>
                <div className="mb-4">
                  <h5 className="fw-bold text-dark mb-3">Om eventet</h5>
                  <div className="mb-4 p-3 rounded-4 border bg-light shadow-sm">
                    <p
                      className="text-muted"
                      style={{ whiteSpace: "pre-wrap", fontSize: "1.05rem" }}
                    >
                      {event.description || "Ingen beskrivning tillagd."}
                    </p>
                  </div>
                </div>

                {/* ENDA STÄLLET DÄR ADRESS/STAD VISAS I TEXT */}
                {/* DENNA RUTA VISAS NU ENDAST FÖR UTLOGGADE */}
                {!user && (
                  <div className="mb-4 p-3 rounded-4 border bg-light shadow-sm">
                    <h6 className="fw-bold mb-2">📍 Plats</h6>
                    <div>
                      <span className="text-dark">
                        Sker i <strong>{event.city || "Stockholm"}</strong>
                      </span>
                      <div className="text-primary small mt-1">
                        <i className="bi bi-lock-fill me-1"></i>
                        Logga in för att se exakt adress
                      </div>
                    </div>
                  </div>
                )}
              </Col>

              <Col lg={5}>
                {user ? (
                  <div className="p-3 bg-light rounded-4 border h-100">
                    {/* KARTAN - Kolla inuti denna komponent om den skriver ut adressen igen! */}
                    <EventMap location={event.location} />

                    <div className="mt-3 text-center small text-muted border-top pt-2">
                      Skapat av{" "}
                      <span className="fw-bold">{event.creatorName}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-100 d-flex align-items-center justify-content-center bg-light rounded-4 border border-dashed py-5">
                    <div className="text-center p-3">
                      <div className="display-4 mb-2">🔒</div>
                      <p className="text-muted small px-4">
                        Karta och exakt plats visas efter inloggning
                      </p>
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-4">
        {/* DELTAGARE - visas endast innehåll för inloggade */}
        <Col md={5} lg={4}>
          <Card className="shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
            <h5 className="fw-bold mb-4">Deltagare</h5>

            {user ? (
              <>
                <Button
                  variant="primary"
                  className="w-100 mb-4 rounded-pill fw-bold"
                  onClick={() => setShowInvite(true)}
                  disabled={!isAttendee}
                >
                  + Bjud in vänner
                </Button>
                <AttendeeList eventId={id!} />
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted small">
                  Logga in för att se vilka som kommer och bjuda in dina vänner.
                </p>
              </div>
            )}
          </Card>
        </Col>

        {/* FEED / LOGIN PROMPT */}
        <Col md={7} lg={8}>
          <Card className="shadow-sm border-0 rounded-4 p-4 bg-white h-100">
            {!user ? (
              <div className="text-center py-5">
                <h3 className="fw-bold">Vill du hänga på?</h3>
                <p className="text-muted mb-4">
                  Logga in för att tacka ja, se deltagarlistan och chatta med
                  gruppen.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  className="px-5 rounded-pill shadow-sm"
                  onClick={() =>
                    navigate("/login", { state: { from: location.pathname } })
                  }
                >
                  Logga in här
                </Button>
              </div>
            ) : checkingStatus ? (
              <div className="text-center py-5">
                <Spinner animation="border" size="sm" />
              </div>
            ) : isAttendee ? (
              <EventFeed eventId={id!} />
            ) : (
              <EventJoinPreview
                invitation={currentInvite}
                loading={loadingInvite}
              />
            )}
          </Card>
        </Col>
      </Row>

      <InviteModal
        show={showInvite}
        onHide={() => setShowInvite(false)}
        eventId={id!}
        eventTitle={event.title}
        eventDate={event.datetime}
        createdBy={event.createdBy}
      />
      <DeleteEventButton eventId={event.id!} creatorId={event.createdBy} />
    </Container>
  );
};

export default EventDetails;
