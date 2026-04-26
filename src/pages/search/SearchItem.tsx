import { ListGroup, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import SendFriendRequest from "../../components/SendFriendRequest";

interface SearchItemProps {
  user: any;
}

const SearchItem = ({ user }: SearchItemProps) => {
  const navigate = useNavigate();

  return (
    <ListGroup.Item className="d-flex align-items-center justify-content-between p-3 bg-white border-bottom border-light">
      {/* Vänster sida: Profilbild och Namn (Klickbar) */}
      <div
        className="d-flex align-items-center"
        style={{ cursor: "pointer" }}
        onClick={() => navigate(`/profile/${user.id}`)}
      >
        <Image
          src={user.photoURL || "https://via.placeholder.com/50"}
          roundedCircle
          className="me-3 border"
          style={{ width: "48px", height: "48px", objectFit: "cover" }}
        />
        <div>
          <h6 className="mb-0 fw-bold text-dark">{user.displayName}</h6>
          <small className="text-muted" style={{ fontSize: "0.75rem" }}>
            Visa profil
          </small>
        </div>
      </div>

      {/* Höger sida: Knappen (Isolerad komponent) */}
      <div onClick={(e) => e.stopPropagation()}>
        <SendFriendRequest targetUser={user} />
      </div>
    </ListGroup.Item>
  );
};

export default SearchItem;
