import { useAuth } from "../Context/AuthContext";
import CreateEvent from "./events/CreateEvent";
import EventView from "./events/EventView";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container mt-5">
      <div className="card shadow-sm p-4 text-center">
        <h1 className="display-6">Inloggningen lyckades! 🎉</h1>
        <p className="lead mt-3">
          Välkommen, <strong>{user?.displayName}</strong>
        </p>
        <p className="text-muted small">ID: {user?.uid}</p>
        {user?.photoURL && (
          <img
            src={user.photoURL}
            alt="Profil"
            className="rounded-circle mx-auto my-3"
            style={{ width: "100px", border: "3px solid #0d6efd" }}
          />
        )}
        <EventView />
        <CreateEvent />

        <div className="mt-4">
          <button onClick={logout} className="btn btn-outline-danger">
            Logga ut
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
