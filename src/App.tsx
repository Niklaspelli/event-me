import "./index.css";
import LandingPage from "./pages/LandingPage";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";
import Login from "./pages/Login";
import LoginMail from "./pages/LoginMail";

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
    <section id="center">
      <ModernNavbar />

      <Routes>
        {/* Startsidan är alltid tillgänglig */}
        <Route path="/" element={<LandingPage />} />

        {/* Login-sidan: Om man redan är inloggad, skicka till dashboard direkt */}
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/login-with-mail"
          element={user ? <Navigate to="/dashboard" /> : <LoginMail />}
        />
        <Route path="/register" element={<Register />} />
        <Route path="/create" element={<CreateEvent />} />
        <Route path="/profile" element={<ProfileSettings />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/friends" element={<FriendList />} />

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
