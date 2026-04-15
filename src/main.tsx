import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import "bootstrap/dist/css/bootstrap.min.css"; // ✅ Import it here
import { AuthProvider } from "./Context/AuthContext.tsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>,
);
