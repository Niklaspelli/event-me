import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSingleUser } from "../../hooks/useSingleUser";
import { Container, Card, Image, Row, Col, Badge } from "react-bootstrap";
import SendFriendRequest from "../../components/SendFriendRequest";
import {
  getCountFromServer,
  collection,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";

const ProfilePage = () => {
  const [friendCount, setFriendCount] = useState<number | null>(null);
  const [eventCount, setEventCount] = useState<number | null>(null);
  // 1. Hämta ID från URL:en (/user/ID_HÄR)
  const { id } = useParams<{ id: string }>();

  // 2. Hämta data om den specifika användaren
  const { user: profile, loading } = useSingleUser(id);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.uid) return;
      try {
        const friendsRef = collection(db, "users", profile.uid, "friends");
        const eventsRef = collection(db, "events");
        const eventsQuery = query(
          eventsRef,
          where("createdBy", "==", profile.uid),
        );
        const [friendsSnap, eventsSnap] = await Promise.all([
          getCountFromServer(friendsRef),
          getCountFromServer(eventsQuery),
        ]);
        setFriendCount(friendsSnap.data().count);
        setEventCount(eventsSnap.data().count);
      } catch (error) {
        console.error("Kunde inte hämta antal vänner:", error);
        setFriendCount(0);
        setEventCount(0);
      }
    };
    fetchStats();
  }, [profile?.uid]);

  // Om användaren inte finns (t.ex. raderad eller felaktigt ID)
  if (!profile) {
    return (
      <Container className="py-5 text-center">
        <h4 className="text-muted">Användaren hittades inte</h4>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card
            className="border-0 shadow-lg overflow-hidden"
            style={{ borderRadius: "20px" }}
          >
            {/* En subtil header-bakgrund för att ge profilbilden mer "pop" */}
            <div
              style={{
                height: "100px",
                background: "linear-gradient(45deg, #3e1e47, #414344)",
                borderBottom: "1px solid rgba(0,0,0,0.05)",
              }}
            />

            <Card.Body
              className="p-4 text-center"
              style={{ marginTop: "-60px" }}
            >
              {/* Profilbild med vit ram för att separera den från bakgrunden */}
              <div className="position-relative d-inline-block">
                <Image
                  src={profile.photoURL || "/default-avatar.png"}
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

              {/* Namn och Online-indikator eller liknande */}
              <div className="mt-3">
                <h2
                  className="mb-0 fw-black text-dark"
                  style={{ letterSpacing: "-0.5px" }}
                >
                  {profile.displayName}
                </h2>
                <Badge
                  bg="light"
                  text="dark"
                  className="mt-2 border fw-normal px-3 py-2 rounded-pill"
                >
                  <i className="bi bi-calendar3 me-2"></i>
                  Medlem sedan{" "}
                  {new Date(
                    profile.createdAt?.seconds * 1000,
                  ).toLocaleDateString("sv-SE", {
                    year: "numeric",
                    month: "long",
                  })}
                </Badge>
              </div>

              {/* Bio / Info Section */}
              {/*   <div className="my-4 px-3">
                <p
                  className="text-secondary mb-0"
                  style={{ lineHeight: "1.6" }}
                >
                  {profile.bio ||
                    "Den här användaren har inte skrivit någon presentation än."}
                </p>
              </div> */}

              {/* Action Buttons (Vänförfrågan) */}
              <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mt-2">
                <SendFriendRequest targetUser={profile} />
              </div>
            </Card.Body>

            {/* En diskret footer med lite statistik (vänner/events) ger ett mer proffsigt intryck */}
            <Card.Footer className="bg-white border-top-0 pb-4 pt-0">
              <Row className="text-center g-0">
                <Col className="border-end">
                  <div className="fw-bold text-dark">
                    {friendCount !== null ? friendCount : "--"}
                  </div>
                  <div className="text-muted small uppercase">Vänner</div>
                </Col>
                <Col>
                  <div className="fw-bold text-dark">
                    {eventCount !== null ? eventCount : "--"}
                  </div>
                  <div className="text-muted small">Events</div>
                </Col>
              </Row>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
