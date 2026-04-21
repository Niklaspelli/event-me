import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { Spinner, Container } from "react-bootstrap";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  // Om ingen användare finns, redirecta till auth-sidan
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Om användaren finns, rendera Outlet (vilket i ditt fall är MainLayout)
  return <Outlet />;
};

export default ProtectedRoute;
