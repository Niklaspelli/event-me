import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext"; // Din auth-hook
import { Spinner, Container } from "react-bootstrap";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Vänta på att Firebase ska svara (viktigt!)
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

  // 2. Om ingen användare är inloggad, skicka till login
  // Vi sparar 'location' så att vi kan skicka tillbaka användaren dit de ville efter login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Om inloggad, visa komponenten
  return children;
};

export default ProtectedRoute;
