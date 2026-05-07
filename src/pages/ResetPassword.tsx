import { useState } from "react";
import { Link } from "react-router-dom";
import { Form, Spinner, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { sendPasswordReset } from "../authService/authService";

import "../index.css";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrMsg("");
    setSuccessMsg("");
    try {
      await sendPasswordReset(email);
      setSuccessMsg(
        "En återställningslänk har skickats till din e-postadress. Kontrollera även skräpposten.",
      );
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        // Här kan du välja Metod 2 (visa info) eller Metod 1 (vara tyst)
        setErrMsg("Vi hittade inget konto med den e-postadressen.");
      } else {
        setErrMsg("Ett fel uppstod. Försök igen senare.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center landing-page-container min-vh-100 py-4">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-sm-8 col-md-6 col-lg-4">
          <div className="card border-0 shadow-lg p-4 p-md-5 rounded-4">
            <div className="text-center mb-4">
              <div className="bg-primary d-inline-block p-3 rounded-circle mb-3 shadow-sm">
                <span className="h2 text-white mb-0">🔑</span>
              </div>
              <h1 className="h4 fw-bold text-dark">Återställ lösenord</h1>
              <p className="text-muted small">
                Ange din e-postadress så skickar vi en länk för att välja ett
                nytt lösenord.
              </p>
            </div>

            {errMsg && (
              <div className="alert alert-danger py-2 small rounded-3">
                {errMsg}
              </div>
            )}

            {successMsg ? (
              <div className="text-center">
                <div className="alert alert-success py-3 small rounded-3 border-0 shadow-sm mb-4">
                  {successMsg}
                </div>
                <Link
                  to="/login"
                  className="btn btn-primary w-100 py-2 rounded-pill fw-bold"
                >
                  Tillbaka till logga in
                </Link>
              </div>
            ) : (
              <Form onSubmit={handleSubmit} className="d-grid gap-3">
                <Form.Group>
                  <Form.Label className="small fw-bold">
                    E-postadress
                  </Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0">
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className="text-muted"
                      />
                    </span>
                    <Form.Control
                      type="email"
                      placeholder="din.mail@exempel.se"
                      className="bg-light border-0 py-3 rounded-end-3 shadow-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="btn btn-primary btn-lg py-3 rounded-3 fw-bold shadow-sm mt-2"
                >
                  {loading ? <Spinner size="sm" /> : "SKICKA LÄNK"}
                </Button>

                <div className="text-center mt-3">
                  <Link
                    to="/login"
                    className="text-decoration-none small fw-bold text-primary"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    Tillbaka till logga in
                  </Link>
                </div>
              </Form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
