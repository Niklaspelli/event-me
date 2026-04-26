import { useParams } from "react-router-dom";
import { useSingleUser } from "../../hooks/useSingleUser";
import { Container, Spinner, Image } from "react-bootstrap";
import SendFriendRequest from "../../components/SendFriendRequest";

const ProfilePage = () => {
  // 1. Hämta ID från URL:en (/user/ID_HÄR)
  const { id } = useParams<{ id: string }>();

  // 2. Hämta data om den specifika användaren
  const { user: profile, loading } = useSingleUser(id);
  console.log("profil", profile);

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
      <div className="text-center mb-4">
        {/* Profilbild */}
        <Image
          src={profile.photoURL || "https://via.placeholder.com/120"}
          roundedCircle
          style={{ width: "120px", height: "120px", objectFit: "cover" }}
          className="shadow-sm border"
        />

        {/* Namn */}
        <h2 className="mt-3 fw-bold text-dark">{profile.displayName}</h2>

        {/* Om du vill visa profil-text/bio kan det ligga här */}
        <p className="text-muted small">
          Medlem sedan{" "}
          {new Date(profile.createdAt?.seconds * 1000).toLocaleDateString()}
        </p>

        {/* Vänförfrågan-knappen */}
        <div className="mt-4">
          <SendFriendRequest targetUser={profile} />
        </div>
      </div>

      <hr className="my-5 opacity-25" />
    </Container>
  );
};

export default ProfilePage;
