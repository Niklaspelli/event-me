import React from "react";
import { useAuth } from "../Context/AuthContext";
import { Facebook } from "react-bootstrap-icons"; // npm install react-bootstrap-icons

const Login: React.FC = () => {
  const { loginWithFacebook, loading } = useAuth();

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-sm-8 col-md-6 col-lg-4">
          <div className="card border-0 shadow-lg p-4 p-md-5 rounded-4">
            {/* Logo / Header */}
            <div className="text-center mb-4">
              <div className="bg-primary d-inline-block p-3 rounded-circle mb-3 shadow-sm">
                <span className="h2 text-white mb-0">🎉</span>
              </div>
              <h1 className="h3 fw-bold text-dark">Välkommen till Event Me!</h1>
              <p className="text-muted">
                Planera stora fester eller hitta spontana häng – allt på ett
                ställe.
              </p>
            </div>

            <hr className="my-4 text-muted opacity-25" />

            {/* Login Section */}
            <div className="d-grid gap-3">
              <button
                onClick={loginWithFacebook}
                disabled={loading}
                className="btn btn-primary btn-lg d-flex align-items-center justify-content-center gap-2 py-3 rounded-3 shadow-sm hover-shadow transition-all"
                aria-label="Logga in med Facebook"
              >
                {loading ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                ) : (
                  <>
                    <Facebook size={24} />
                    <span className="fw-semibold">Fortsätt med Facebook</span>
                  </>
                )}
              </button>

              <button
                className="btn btn-outline-dark btn-lg py-3 rounded-3 fw-semibold shadow-sm"
                onClick={() => alert("Kommer snart!")}
                aria-label="Logga in med e-post"
              >
                Logga in med E-post
              </button>
            </div>

            {/* Footer / Disclaimer */}
            <div className="mt-5 text-center">
              <p className="small text-muted mb-0">
                Genom att logga in godkänner du våra
                <a href="#terms" className="text-decoration-none ms-1">
                  Användarvillkor
                </a>
                .
              </p>
              <p className="small text-muted mt-2">
                Ingen Facebook?{" "}
                <a
                  href="#signup"
                  className="fw-bold text-primary text-decoration-none"
                >
                  Skapa konto
                </a>
              </p>
            </div>
          </div>

          {/* Bottom support text */}
          <p className="text-center text-muted mt-4 small">
            &copy; 2026 EventApp AB
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
