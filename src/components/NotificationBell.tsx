import { useState, useEffect } from "react";
import { Nav, Badge, Dropdown, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import {
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  updateDoc,
  doc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import InviteActions from "./InviteAction";

const NotificationBell = () => {
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [eventInvites, setEventInvites] = useState<any[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  // 1. Lyssna på vänförfrågningar
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "friendRequests"),
      where("toId", "==", user.uid),
      where("status", "==", "pending"),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFriendRequests(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    });
    return () => unsubscribe();
  }, [user]);

  // 2. Lyssna på event-inbjudningar
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "eventInvitations"),
      where("toId", "==", user.uid),
      where("status", "==", "pending"),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEventInvites(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    });
    return () => unsubscribe();
  }, [user]);

  const totalNotifications = friendRequests.length + eventInvites.length;

  const handleAcceptFriend = async (req: any) => {
    try {
      const batch = writeBatch(db);
      const myFriendRef = doc(db, "users", user.uid, "friends", req.fromId);
      batch.set(myFriendRef, {
        displayName: req.fromName,
        photoURL: req.fromPhoto || "",
        addedAt: serverTimestamp(),
      });
      const theirFriendRef = doc(db, "users", req.fromId, "friends", user.uid);
      batch.set(theirFriendRef, {
        displayName: user.displayName || "Anonym",
        photoURL: user.photoURL || "",
        addedAt: serverTimestamp(),
      });
      batch.delete(doc(db, "friendRequests", req.id));
      await batch.commit();
    } catch (error) {
      console.error("Fel vid acceptans av vän:", error);
    }
  };

  /*  const handleAcceptEvent = async (invite: any) => {
    try {
      const batch = writeBatch(db);
      const attendeeRef = doc(
        db,
        "events",
        invite.eventId,
        "attendees",
        user.uid,
      );
      batch.set(attendeeRef, {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL || "",
        status: "going",
        joinedAt: serverTimestamp(),
      });
      batch.delete(doc(db, "eventInvitations", invite.id));
      await batch.commit();
    } catch (error) {
      console.error("Fel vid acceptans av event:", error);
    }
  }; */

  const handleAcceptEvent = async (invitation) => {
    console.log("Hela inbjudans-objektet:", invitation); // Kolla i konsolen!

    if (!invitation.eventDate) {
      console.error("STOPP! eventDate saknas i inbjudan. Kolla databasen.");
      return;
    }
    try {
      // 1. Skapa "biljetten" i attendees-subcollection
      // Vi använder setDoc med user.uid för att undvika dubbletter!
      await setDoc(
        doc(db, "events", invitation.eventId, "attendees", user.uid),
        {
          uid: user.uid,
          displayName: user.displayName || "Anonym",
          photoURL: user.photoURL || "",
          status: "going",
          title: invitation.eventTitle, // Hämtas från inbjudan
          datetime: invitation.eventDate, // Hämtas från inbjudan
          joinedAt: serverTimestamp(),
        },
      );

      // 2. Markera inbjudan som accepterad (eller ta bort den)
      await updateDoc(doc(db, "eventInvitations", invitation.id), {
        status: "accepted",
      });

      console.log("Inbjudan accepterad!");
    } catch (error) {
      console.error("Fel vid accept:", error);
    }
  };

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
        {/* SEKTION: VÄNNER */}
        <Dropdown.Header>
          Vänförfrågningar ({friendRequests.length})
        </Dropdown.Header>
        {friendRequests.length === 0 && (
          <div className="p-2 text-muted small text-center">
            Inga vänförfrågningar
          </div>
        )}
        {friendRequests.map((req) => (
          <div key={req.id} className="p-3 border-bottom">
            <div className="d-flex align-items-center mb-2">
              <img
                src={req.fromPhoto || "https://via.placeholder.com/40"}
                className="rounded-circle me-2"
                width="30"
                height="30"
                alt=""
              />
              <span className="small fw-bold">{req.fromName}</span>
            </div>
            <div className="d-flex gap-2">
              <Button
                size="sm"
                variant="primary"
                className="w-100"
                onClick={() => handleAcceptFriend(req)}
              >
                Acceptera
              </Button>
              <Button size="sm" variant="outline-secondary" className="w-100">
                Neka
              </Button>
            </div>
          </div>
        ))}

        {/* SEKTION: EVENTS */}
        <Dropdown.Header className="mt-2">
          Eventinbjudningar ({eventInvites.length})
        </Dropdown.Header>
        {eventInvites.length === 0 && (
          <div className="p-2 text-muted small text-center">
            Inga inbjudningar
          </div>
        )}
        {eventInvites.map((invite) => (
          <div key={invite.id} className="p-3 border-bottom bg-light">
            <p className="small mb-1 text-dark">
              <strong>{invite.fromName}</strong> bjöd in dig till:
            </p>
            <div
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigate(`/events/event-details/${invite.eventId}`);
              }}
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
