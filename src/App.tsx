import "./index.css";
import LandingPage from "./pages/LandingPage";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";
import Login from "./pages/Login";
import LoginMail from "./pages/LoginMail";
import ProtectedRoute from "./auth/ProtectedRoute";

import Dashboard from "./pages/DashBoard";
import EventDetails from "./pages/events/EventDetails";
import Register from "./pages/Register";
import CreateEvent from "./pages/events/CreateEvent";
import ModernNavbar from "./components/ModernNavbar";
import ProfileSettings from "./pages/ProfileSettings";
import SearchPage from "./pages/SearchPage";
import FriendList from "./pages/FriendList";

function App() {
  const { user, loading } = useAuth();

  if (loading) return null; // Eller en spinner

  return (
    <section
      id="center"
      style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}
    >
      {/* Navbaren syns nu bara om user inte är null/undefined */}
      {user && <ModernNavbar />}
      <Routes>
        {/* PUBLIKA RUTTER */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/login-with-mail"
          element={user ? <Navigate to="/dashboard" /> : <LoginMail />}
        />
        <Route path="/register" element={<Register />} />

        {/* SKYDDADE RUTTER (Kräver inloggning) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <FriendList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/event-details/:id"
          element={
            <ProtectedRoute>
              <EventDetails />
            </ProtectedRoute>
          }
        />

        {/* Fallback - skicka hem folk som går vilse */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </section>
  );
}

export default App;
