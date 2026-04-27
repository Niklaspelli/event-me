/* import { useAuth } from "../Context/AuthContext";
import CreateEvent from "./events/CreateEvent";
import EventView from "./events/EventView";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container mt-5">
      <div className="card shadow-sm p-4 text-center">
        <h1 className="display-6">Inloggningen lyckades! 🎉</h1>
        <p className="lead mt-3">
          Välkommen, <strong>{user?.displayName}</strong>
        </p>
        <p className="text-muted small">ID: {user?.uid}</p>
        {user?.photoURL && (
          <img
            src={user.photoURL}
            alt="Profil"
            className="rounded-circle mx-auto my-3"
            style={{ width: "100px", border: "3px solid #0d6efd" }}
          />
        )}
        <EventView />
        <CreateEvent />

        <div className="mt-4">
          <button onClick={logout} className="btn btn-outline-danger">
            Logga ut
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; */

import { Container, Row, Col, Button, Card, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import EventListShort from "./events/EventListShort";
import EventView from "./events/EventView";
import { useAuth } from "../Context/AuthContext";

import { useEvents } from "../hooks/useEvents";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  console.log("user", user);
  const { events } = useEvents();
  return (
    <Container className="py-4 ">
      <h1 className="display-6 d-flex justify-content-center ">
        Inloggningen lyckades! 🎉
      </h1>
      <p className="lead mt-3 d-flex justify-content-center">
        Välkommen, <strong>{user?.displayName}</strong>
      </p>
      <div className="mb-4 d-flex justify-content-center">
        <Image
          src={user?.photoURL ? user.photoURL : "/default-avatar.png"}
          roundedCircle
          style={{
            width: "120px",
            height: "120px",
            objectFit: "cover",
            border: "5px solid white",
          }}
          className="shadow-sm"
        />
      </div>
      {/* HEADER: Välkomsttext och Snabbknapp */}
      <div className="d-flex justify-content-center align-items-center mb-5">
        <Button
          variant="dark"
          className="px-4 py-3 fw-bold shadow btn-lg"
          onClick={() => navigate("/create")}
        >
          + Skapa Event
        </Button>
      </div>
      {/* En liten "Stats"-widget under listan? */}
      <Card className="mt-4 border-0 rounded-4 bg-dark text-warning shadow align-items-center">
        <Card.Body className="p-6">
          <h6 className="opacity-75">Totalt antal häng:</h6>
          <div className="display-5 fw-bold align-items-center">
            {events?.length || 0}
          </div>
          <small>Planerade framöver</small>
        </Card.Body>
      </Card>
      <Row className="g-4">
        {/* VÄNSTER: Kalendern (Tar större plats på desktop) */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <Card.Body className="p-0">
              <EventView />
            </Card.Body>
          </Card>
        </Col>

        {/* HÖGER: De 3 närmaste händelserna */}
        <Col lg={4}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="text-black fw-bold m-2">Kommande 3</h5>
          </div>

          {/* Här mappar du bara de 3 första händelserna */}
          <EventListShort events={events?.slice(0, 3) || []} />
        </Col>
      </Row>
      <div className="mt-4">
        <button onClick={logout} className="btn btn-outline-danger">
          Logga ut
        </button>
      </div>
    </Container>
  );
};

export default Dashboard;
