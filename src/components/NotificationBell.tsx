import { useState, useEffect } from "react";
import { Nav, Badge, Dropdown, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import InviteActions from "./InviteAction";

// IMPORTERA DINA SERVICES HÄR
import {
  acceptFriendRequest,
  declineFriendRequest,
} from "../services/friendService";

const NotificationBell = () => {
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [eventInvites, setEventInvites] = useState<any[]>([]);
  const [generalNotifs, setGeneralNotifs] = useState<any[]>([]);
  const { user } = useAuth() as any;
  const navigate = useNavigate();

  // --- Lyssna på data (Behåll dessa tre) ---
  useEffect(() => {
    if (!user) return;

    // Vänner
    const unsubFriends = onSnapshot(
      query(
        collection(db, "friendRequests"),
        where("toId", "==", user.uid),
        where("status", "==", "pending"),
      ),
      (snap) =>
        setFriendRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );

    // Eventinbjudningar
    const unsubInvites = onSnapshot(
      query(
        collection(db, "eventInvitations"),
        where("toId", "==", user.uid),
        where("status", "==", "pending"),
      ),
      (snap) =>
        setEventInvites(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );

    // Generella notiser (Feed/Inställt)
    const unsubGeneral = onSnapshot(
      query(
        collection(db, "notifications"),
        where("toId", "==", user.uid),
        where("isRead", "==", false),
        orderBy("createdAt", "desc"),
      ),
      (snap) =>
        setGeneralNotifs(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );

    return () => {
      unsubFriends();
      unsubInvites();
      unsubGeneral();
    };
  }, [user]);

  // --- Hantera klick (Använder services) ---
  const handleNotifClick = async (notif: any) => {
    await updateDoc(doc(db, "notifications", notif.id), { isRead: true });
    if (notif.eventId) navigate(`/events/event-details/${notif.eventId}`);
  };

  const totalNotifications =
    friendRequests.length + eventInvites.length + generalNotifs.length;

  return (
    <Dropdown align="end">
      <Dropdown.Toggle as={Nav.Link} className="position-relative">
        <FontAwesomeIcon icon={faBell} size="lg" />
        {totalNotifications > 0 && (
          <Badge
            pill
            bg="danger"
            className="position-absolute top-0 start-100 translate-middle"
            style={{ fontSize: "0.6rem" }}
          >
            {totalNotifications}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu
        style={{ width: "320px", maxHeight: "450px", overflowY: "auto" }}
      >
        {/* HÄNDELSER */}
        <Dropdown.Header>Händelser ({generalNotifs.length})</Dropdown.Header>
        {generalNotifs.map((notif) => (
          <div
            key={notif.id}
            className="p-3 border-bottom"
            style={{ cursor: "pointer" }}
            onClick={() => handleNotifClick(notif)}
          >
            <p className="small mb-0 text-black text-decoration-underline">
              {notif.message}
            </p>
          </div>
        ))}

        {/* VÄNNER - Nu mycket renare! */}
        <Dropdown.Header className="mt-2 text-black">
          Vänförfrågningar ({friendRequests.length})
        </Dropdown.Header>
        {friendRequests.map((req) => (
          <div key={req.id} className="p-3 border-bottom">
            <div
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigate(`/profile/${req.fromId}`);
              }}
            >
              <div className="d-flex align-items-center mb-2">
                <img
                  src={req.photoURL || "/default-avatar.png"}
                  className="rounded-circle me-2"
                  width="30"
                  height="30"
                  alt=""
                />
                <span className="small fw-bold text-black text-decoration-underline">
                  {req.fromName}
                </span>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Button
                size="sm"
                variant="primary"
                className="w-100"
                onClick={() => acceptFriendRequest(req, user)}
              >
                Acceptera
              </Button>
              <Button
                size="sm"
                variant="outline-secondary"
                className="w-100"
                onClick={() => declineFriendRequest(req.id)}
              >
                Neka
              </Button>
            </div>
          </div>
        ))}

        {/* EVENTS */}
        <Dropdown.Header className="mt-2 text-black">
          Eventinbjudningar ({eventInvites.length})
        </Dropdown.Header>
        {eventInvites.map((invite) => (
          <div key={invite.id} className="p-3 border-bottom bg-light">
            <div
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(`/events/event-details/${invite.eventId}`)
              }
            >
              <p className="fw-bold small mb-2 text-primary text-decoration-underline">
                {invite.eventTitle}
              </p>
            </div>
            <InviteActions invitation={invite} />
          </div>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationBell;
