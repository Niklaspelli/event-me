import { Dropdown, Button } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom"; // Lade till Link
import DeleteEventButton from "./DeleteEventButton";
import { useSingleEvent } from "../../hooks/useSingleEvent";
import { useAuth } from "../../Context/AuthContext";

// Props i React skickas som ett objekt, så vi destrukturerar { id }
function EventDropdownMenu({ id }: { id: string; createdBy: string }) {
  const { user } = useAuth() as any;
  const navigate = useNavigate();
  const { event, loading } = useSingleEvent(id);

  // 1. Vänta tills eventet har laddats
  if (loading) return null;
  if (!event) return null;

  // 2. Kontrollera ägarskap korrekt
  // Vi kollar mot event.creatorId (eller vad ditt fält heter i Firestore)
  const isOwnEvent = user && event && user?.uid === event.createdBy;

  console.log("uid:", user.uid, "creatorId", event.createdBy);

  // Om du vill att menyn BARA ska synas för ägaren:
  // if (!isOwnEvent) return null;

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        as={Button}
        variant="light"
        className="border-0 p-0 bg-transparent shadow-none" // shadow-none tar bort ful blå outline
      >
        <span style={{ fontSize: "1.5rem", lineHeight: "1" }}>⋯</span>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item as={Link} to={`/events/event-details/${id}`}>
          Visa detaljer
        </Dropdown.Item>

        {isOwnEvent && (
          <>
            <Dropdown.Divider /> {/* Snygg linje innan farliga alternativ */}
            <Dropdown.Item onClick={() => navigate(`/events/update/${id}`)}>
              Redigera
            </Dropdown.Item>
            {/* Vi lägger DeleteEventButton direkt eller hanterar klicket */}
            <div className="dropdown-item text-danger p-0">
              <DeleteEventButton eventId={id} creatorId={event.creatorId} />
            </div>
            <DeleteEventButton
              eventId={event.id!}
              creatorId={event.createdBy}
            />
          </>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default EventDropdownMenu;
