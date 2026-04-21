import { useState } from "react";
import {
  Navbar,
  Container,
  Nav,
  NavDropdown,
  Form,
  Image,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUserFriends,
  faSignOutAlt,
  faUserEdit,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../Context/AuthContext";
import NotificationBell from "./NotificationBell";

const ModernNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setSearchQuery("");
    }
  };

  const styles = {
    navbar: {
      background: "rgba(15, 15, 15, 0.95)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      padding: "0.8rem 0",
    },
    searchBar: {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      color: "white",
      borderRadius: "20px",
      paddingLeft: "40px",
    },
    searchIcon: {
      position: "absolute" as const,
      left: "15px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "rgba(255, 255, 255, 0.5)",
      zIndex: 10,
    },
    avatar: {
      width: "35px",
      height: "35px",
      objectFit: "cover" as const,
      border: "2px solid #0d6efd",
    },
  };

  return (
    <Navbar expand="lg" variant="dark" sticky="top" style={styles.navbar}>
      <style>
        {`
          .custom-search::placeholder {
            color: rgba(255, 255, 255, 0.7) !important;
            opacity: 1; /* Firefox kräver detta */
          }
          .custom-search:focus {
            background-color: rgba(255, 255, 255, 0.15) !important;
            color: white !important;
            border-color: rgba(255, 255, 255, 0.4) !important;
            box-shadow: none !important;
          }
        `}
      </style>
      <Container>
        <Navbar.Brand
          onClick={() => navigate("/dashboard")}
          style={{ cursor: "pointer", fontWeight: "bold" }}
        >
          EventMe
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          {/* SÖKBAR - Responsiv */}
          <Form
            onSubmit={handleSearch}
            className="mx-auto my-2 my-lg-0"
            style={{ position: "relative", width: "100%", maxWidth: "400px" }}
          >
            <FontAwesomeIcon icon={faSearch} style={styles.searchIcon} />
            <Form.Control
              type="search"
              placeholder="Sök användare..."
              style={styles.searchBar}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Sök"
              className="custom-search text-white"
            />
          </Form>

          <Nav className="ms-auto align-items-center">
            <Nav.Link onClick={() => navigate("/friends")} className="me-3">
              <FontAwesomeIcon icon={faUserFriends} />{" "}
              <span className="d-lg-none">Vänner</span>
              <NotificationBell />
            </Nav.Link>

            {/* PROFIL DROPDOWN */}
            <NavDropdown
              title={
                <Image
                  src={user?.photoURL || "https://via.placeholder.com/35"}
                  roundedCircle
                  style={styles.avatar}
                />
              }
              id="profile-dropdown"
              align="end"
            >
              <NavDropdown.Header>
                Inloggad som:{" "}
                <strong>{user?.displayName || "Användare"}</strong>
              </NavDropdown.Header>
              <NavDropdown.Item onClick={() => navigate("/profile")}>
                <FontAwesomeIcon icon={faUserEdit} className="me-2" />{" "}
                Inställningar
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={logout} className="text-danger">
                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Logga
                ut
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default ModernNavbar;
