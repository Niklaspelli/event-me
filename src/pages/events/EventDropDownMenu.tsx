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
        className="border-0 p-0 bg-transparent shadow-none"
      >
        <span style={{ fontSize: "1.5rem", lineHeight: "1" }}>⋯</span>
      </Dropdown.Toggle>

      {/* Vi lägger till en min-width för att göra rutan större och text-center */}
      <Dropdown.Menu style={{ minWidth: "200px" }} className="p-2 shadow-sm">
        <div className="d-flex flex-column align-items-center w-100">
          <Dropdown.Item
            as={Link}
            to={`/events/event-details/${id}`}
            className="text-center w-100 py-2 rounded-2"
          >
            Visa detaljer
          </Dropdown.Item>

          {isOwnEvent && (
            <>
              <Dropdown.Divider className="w-75 mx-auto" />

              {/* Container som centrerar innehållet vertikalt och horisontellt */}
              <div className="d-flex flex-column align-items-center w-100 gap-2">
                <Dropdown.Item
                  onClick={() => navigate(`/events/update/${id}`)}
                  className="text-center w-100 py-2 rounded-2"
                >
                  Redigera
                </Dropdown.Item>

                {/* Vi wrappar Delete-knappen i en div för att centrera den om komponenten är liten */}
                <div className="w-100 d-flex justify-content-center py-2">
                  <DeleteEventButton
                    eventId={id} // Använd id direkt från props
                    creatorId={event.createdBy}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default EventDropdownMenu;
