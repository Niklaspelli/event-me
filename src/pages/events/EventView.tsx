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
  const { events, loading, loadingMore, loadMore } = useEvents();

  console.log("events från eventview", events);

  return (
    <Container className="py-4">
      <header className="text-center mb-5">
        <h2 className="fw-bold text-black mb-3">Dina Events</h2>
        <p className="text-black-50">Här är vad som händer framöver</p>

        {/* Snyggare knapp-grupp för växling */}
        <ButtonGroup className="shadow-sm">
          <Button
            variant={viewMode === "calendar" ? "light" : "outline"}
            onClick={() => setViewMode("calendar")}
            className="px-4"
          >
            📅 Kalender
          </Button>
          <Button
            variant={viewMode === "list" ? "light" : "outline"}
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
            <>
              <EventList events={events} />
              <div className="text-center mt-5 mb-5">
                <Button
                  variant="outline-light"
                  onClick={loadMore}
                  className="rounded-pill px-5 py-2"
                  style={{ borderStyle: "dashed" }}
                >
                  {loadingMore ? "Ladda fler..." : "Visa fler events"}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Container>
  );
};

export default EventView;
