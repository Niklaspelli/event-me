import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

interface Event {
  id: string;
  title: string;
  datetime: string;
  location?: string;
}

interface Props {
  events: Event[];
}

const EventListShort = ({ events }: Props) => {
  const navigate = useNavigate();

  if (events.length === 0) {
    return (
      <Card className="border-0 bg-transparent text-center py-4">
        <p className="text-white-50">Inga kommande händelser just nu.</p>
      </Card>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {events.map((event) => {
        const eventDate = new Date(event.datetime);

        return (
          <Card
            key={event.id}
            className="border-0 shadow-sm rounded-4 overflow-hidden event-short-card"
            style={{ cursor: "pointer", transition: "transform 0.2s" }}
            onClick={() => navigate(`/events/event-details/${event.id}`)}
          >
            <Card.Body className="p-3 d-flex align-items-center">
              {/* Datum-ikon (Snygg fyrkant med datum) */}
              <div
                className="date-box d-flex flex-column align-items-center justify-content-center me-3 rounded-3 text-white"
                style={{
                  width: "55px",
                  height: "55px",
                  background:
                    "linear-gradient(135deg, #0d6efd 0%, #004dc7 100%)",
                  lineHeight: "1",
                }}
              >
                <span
                  style={{
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                  }}
                >
                  {eventDate.toLocaleDateString("sv-SE", { month: "short" })}
                </span>
                <span style={{ fontSize: "1.3rem", fontWeight: "bold" }}>
                  {eventDate.getDate()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-grow-1 overflow-hidden">
                <h6 className="mb-0 fw-bold text-dark text-truncate">
                  {event.title}
                </h6>
                <div className="text-muted small d-flex align-items-center gap-2 mt-1">
                  <span>
                    🕒{" "}
                    {eventDate.toLocaleTimeString("sv-SE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {event.location && (
                    <span className="text-truncate">
                      📍 {event.location.split(",")[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* Pil för att indikera klickbarhet */}
              <div className="ms-2 text-primary opacity-25">
                <span style={{ fontSize: "1.2rem" }}>›</span>
              </div>
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
};

export default EventListShort;
