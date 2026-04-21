import { Outlet } from "react-router-dom";
import ModernNavbar from "../components/ModernNavbar";

const MainLayout = () => {
  return (
    <div
      className="main-layout"
      style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}
    >
      {/* Navbaren visas bara för rutter inuti denna layout */}
      <ModernNavbar />

      <main className="py-4">
        {/* Outlet är där Dashboard, EventDetails osv. renderas */}
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
