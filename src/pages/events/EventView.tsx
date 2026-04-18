import { useState } from "react";
import { Container, Button, ButtonGroup } from "react-bootstrap";
import { useEvents } from "../../hooks/useEvents";

import EventList from "./EventList";
import UserCalendar from "./UserCalender";
import "./event-styling.css";

// Definiera vilka lägen som finns
type ViewMode = "calendar" | "list";

const EventView = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const { events, loading } = useEvents();

  return (
    <Container className="py-4">
      <header className="text-center mb-5">
        <h2 className="fw-bold text-white mb-3">Dina Events</h2>

        {/* Snyggare knapp-grupp för växling */}
        <ButtonGroup className="shadow-sm">
          <Button
            variant={viewMode === "calendar" ? "light" : "outline-light"}
            onClick={() => setViewMode("calendar")}
            className="px-4"
          >
            📅 Kalender
          </Button>
          <Button
            variant={viewMode === "list" ? "light" : "outline-light"}
            onClick={() => setViewMode("list")}
            className="px-4"
          >
            📋 Lista
          </Button>
        </ButtonGroup>
      </header>

      {/* Om listan är tom */}
      {events.length === 0 ? (
        <div className="text-center py-5 bg-dark rounded-4 shadow-sm border border-secondary">
          <p className="text-muted fs-5">
            Du har inte skapat eller gått med i några events än.
          </p>
          <Button variant="primary" href="/create">
            Skapa ditt första event
          </Button>
        </div>
      ) : (
        /* Animated switch mellan vyer */
        <div className="mt-4">
          {viewMode === "calendar" ? (
            <UserCalendar events={events} />
          ) : (
            <EventList events={events} />
          )}
        </div>
      )}
    </Container>
  );
};

export default EventView;
