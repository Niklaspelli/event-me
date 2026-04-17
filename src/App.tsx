import "./index.css";
import LandingPage from "./pages/LandingPage";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/DashBoard";
import EventDetails from "./pages/events/EventDetails";

function App() {
  const { user, loading } = useAuth();

  if (loading) return null; // Eller en spinner

  return (
    <section id="center">
      <Routes>
        {/* Startsidan är alltid tillgänglig */}
        <Route path="/" element={<LandingPage />} />

        {/* Login-sidan: Om man redan är inloggad, skicka till dashboard direkt */}
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />

        {/* Dashboard: Om man INTE är inloggad och försöker gå hit, skicka till login */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route path="/events/event-details/:id" element={<EventDetails />} />
      </Routes>
    </section>
  );
}

export default App;
