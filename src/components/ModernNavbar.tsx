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
    e.stopPropagation(); // Hindrar händelsen från att spridas till sidan under
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery.trim()}`);
      setSearchQuery("");
    }
  };

  return (
    <Navbar
      expand="lg"
      variant="dark"
      className="bg-dark border-bottom shadow-sm py-2"
      sticky="top"
    >
      <style>
        {`
      /* Uppdaterad styling för att matcha det ljusa temat */
      .custom-search::placeholder { color: #94a3b8 !important; }
      .custom-search:focus {
        background-color: #f4f5f7 !important;
        border-color: #f6f6f7 !important;
        box-shadow: none !important;
      }
      /* Fix för att centrera text och ikoner i Nav.Link */
      .nav-link {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    `}
      </style>
      <Container>
        {/* BRAND - Vänsterjusterad */}
        <Navbar.Brand
          onClick={() => navigate("/dashboard")}
          className="fw-bold fs-4 text-white"
          style={{ cursor: "pointer", letterSpacing: "-0.5px" }}
        >
          EventMe
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          {/* SÖKFÄLT - Centrerat och balanserat */}
          <Form
            onSubmit={handleSearch}
            className="d-flex mx-auto my-2 my-lg-0"
            style={{ maxWidth: "400px", width: "100%", position: "relative" }}
          >
            <div className="position-relative w-100 d-flex align-items-center">
              <FontAwesomeIcon
                icon={faSearch}
                className="position-absolute ms-3 text-muted"
              />
              <Form.Control
                type="text"
                placeholder="Sök användare..."
                className="custom-search bg-light border-0 ps-5 py-2 rounded-pill"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </Form>

          {/* NAV LINKS - Högerjusterade och perfekt vertikalt centrerade */}
          <Nav className="ms-auto d-flex align-items-center">
            {/* Notifikationer */}
            <div className="me-2">
              <NotificationBell />
            </div>

            {/* Vänner Link */}
            <Nav.Link
              onClick={() => navigate("/friends")}
              className="text-light fw-medium px-3"
            >
              <FontAwesomeIcon
                icon={faUserFriends}
                className="text-secondary"
              />
              <span>Vänner</span>
            </Nav.Link>

            {/* Profil Dropdown */}
            <NavDropdown
              title={
                <div className="d-inline-flex align-items-center">
                  <Image
                    src={user?.photoURL || "/default-avatar.png"}
                    roundedCircle
                    style={{
                      width: "35px",
                      height: "35px",
                      objectFit: "cover",
                      border: "2px solid #f1f5f9",
                    }}
                  />
                </div>
              }
              id="profile-dropdown"
              align="end"
              className="ms-2"
            >
              <NavDropdown.Header className="py-2">
                <small className="text-muted d-block">Inloggad som</small>
                <span className="fw-bold text-dark">{user?.displayName}</span>
              </NavDropdown.Header>
              <NavDropdown.Divider />
              <NavDropdown.Item
                onClick={() => navigate("/profile")}
                className="py-2"
              >
                <FontAwesomeIcon
                  icon={faUserEdit}
                  className="me-2 text-muted"
                />
                Inställningar
              </NavDropdown.Item>
              <NavDropdown.Item onClick={logout} className="text-danger py-2">
                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                Logga ut
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default ModernNavbar;
