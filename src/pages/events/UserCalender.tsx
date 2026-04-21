import { useState, useMemo } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  type Event as CalendarEvent,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isSameDay } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button, Card, Container } from "react-bootstrap";
import sv from "date-fns/locale/sv";
import "./event-styling.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
// Importera din AppEvent-typ om du har den i types.ts

const locales = { sv: sv };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Interface för kalenderns interna format
interface ICalendarItem extends CalendarEvent {
  id: string;
  description?: string;
  location?: string; // Lägg till plats här
}

export default function UserCalendar({ events: eventsProp }: { events: any }) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 1. Normalisera events till en platt array
  const allEvents = useMemo(() => {
    if (!eventsProp) return [];
    if (Array.isArray(eventsProp)) return eventsProp;
    return [...(eventsProp.upcoming || []), ...(eventsProp.past || [])];
  }, [eventsProp]);

  // 2. Konvertera Firestore/String datum till JS Date-objekt
  const calendarItems = useMemo((): ICalendarItem[] => {
    return allEvents
      .filter((e) => e.datetime || e.datetime) // Se till att datum finns
      .map((event) => {
        // Hantera om datumet kommer som Firebase Timestamp, sträng eller Date
        const dateSource = event.datetime || event.createAt;
        const dateObj = dateSource?.toDate
          ? dateSource.toDate()
          : new Date(dateSource);
        return {
          id: event.id,
          title: event.title,
          start: dateObj,
          end: new Date(dateObj.getTime() + 60 * 60 * 1000),
          description: event.description,
          location: event.location, // Inkludera platsen
        };
      });
  }, [allEvents]);

  // 3. Filtrera events för den valda dagen
  const dailyEvents = useMemo(() => {
    if (!selectedDate) return [];
    return calendarItems.filter((item) =>
      isSameDay(item.start as Date, selectedDate),
    );
  }, [selectedDate, calendarItems]);

  return (
    <Container className="mt-4">
      <Card
        className="border-0 shadow-sm rounded-4 p-3 mb-4"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div style={{ height: 500 }}>
          <Calendar
            localizer={localizer}
            events={calendarItems}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            culture="sv"
            messages={{
              next: "Nästa",
              previous: "Föregående",
              today: "Idag",
              month: "Månad",
              week: "Vecka",
              agenda: "Agenda",
            }}
            onSelectEvent={(event: any) =>
              navigate(`/events/event-details/${event.id}`)
            }
            onSelectSlot={({ start }) => setSelectedDate(start)}
            selectable
            style={{ borderRadius: "10px" }}
          />
        </div>
      </Card>

      {selectedDate && (
        <div className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold">
              Händelser {selectedDate.toLocaleDateString("sv-SE")}
            </h4>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setSelectedDate(null)}
            >
              Stäng dagvy
            </Button>
          </div>

          <div className="d-flex flex-wrap gap-3">
            {dailyEvents.length === 0 ? (
              <p className="text-muted">Inga händelser planerade denna dag.</p>
            ) : (
              dailyEvents.map((event) => (
                <Card
                  key={event.id}
                  className="shadow-sm border-0 rounded-4"
                  style={{ width: "20rem", backgroundColor: "#f8f9fa" }}
                >
                  <Card.Body>
                    <Card.Title className="fw-bold">{event.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-primary">
                      {format(event.start as Date, "HH:mm")} -{" "}
                      {format(event.end as Date, "HH:mm")}
                    </Card.Subtitle>
                    <Card.Text
                      className="text-truncate"
                      style={{ maxHeight: "50px" }}
                    >
                      {event.description}
                    </Card.Text>
                    <Button
                      variant="primary"
                      className="w-100 rounded-pill"
                      onClick={() =>
                        navigate(`/events/event-details/${event.id}`)
                      }
                    >
                      Visa detaljer
                    </Button>
                  </Card.Body>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </Container>
  );
}
