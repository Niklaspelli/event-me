import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { Image } from "react-bootstrap";

const AttendeeList = ({ eventId }: { eventId: string }) => {
  const [attendees, setAttendees] = useState<any[]>([]);

  useEffect(() => {
    const attendeesRef = collection(db, "events", eventId, "attendees");
    const unsubscribe = onSnapshot(attendeesRef, (snap) => {
      setAttendees(snap.docs.map((doc) => doc.data()));
    });
    return () => unsubscribe();
  }, [eventId]);

  return (
    <div className="mt-4">
      <h6 className="fw-bold mb-3">Deltagare ({attendees.length})</h6>
      <div className="d-flex flex-wrap gap-2">
        {attendees.map((person, index) => (
          <div key={index} className="text-center" title={person.displayName}>
            <Image
              src={person.photoURL || "/default-avatar.png"}
              roundedCircle
              width={45}
              height={45}
              className="border border-2 border-white shadow-sm"
              style={{ objectFit: "cover" }}
            />
            <p className="mb-0" style={{ fontSize: "0.7rem" }}>
              {person.displayName.split(" ")[0]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendeeList;
