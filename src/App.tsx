import "./index.css";
import LandingPage from "./pages/LandingPage";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";
import Login from "./pages/Login";
import ProtectedRoute from "./auth/ProtectedRoute";

import Dashboard from "./pages/DashBoard";
import EventDetails from "./pages/events/EventDetails";
import Register from "./pages/Register";
import CreateEvent from "./pages/events/CreateEvent";
import ProfileSettings from "./pages/ProfileSettings";
import SearchPage from "./pages/SearchPage";
import FriendList from "./pages/FriendList";
import MainLayout from "./pages/MainLayout";
import NotFound from "./pages/NotFound";

function App() {
  const { user, loading } = useAuth();

  if (loading) return null; // Eller en spinner

  return (
    <section
      id="center"
      style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}
    >
      <Routes>
        {/* --- PUBLIKA RUTTER (Ingen Navbar) --- */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route path="/register" element={<Register />} />

        {/* --- SKYDDADE RUTTER (Kräver Auth + Visar Navbar via MainLayout) --- */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create" element={<CreateEvent />} />
            <Route
              path="/events/event-details/:id"
              element={<EventDetails />}
            />
            <Route path="/friends" element={<FriendList />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/search" element={<SearchPage />} />
          </Route>
        </Route>

        {/* --- FALLBACK --- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </section>
  );
}

export default App;
