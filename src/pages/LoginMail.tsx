import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Form, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faEnvelope,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

const LoginMail: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const errRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError("Felaktig e-postadress eller lösenord.");
      errRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Vi använder samma wrapper-klasser som i förra komponenten
    <div className="container-fluid d-flex align-items-center justify-content-center bg-dark min-vh-100">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-sm-8 col-md-6 col-lg-4">
          {/* Tillbaka-länk */}
          <Link
            to="/login"
            className="text-decoration-none small mb-3 d-inline-block text-muted"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Tillbaka
          </Link>

          <div className="card border-0 shadow-lg p-4 p-md-5 rounded-4">
            <div className="text-center mb-4">
              <h1 className="h3 fw-bold">Logga in</h1>
              <p className="text-muted">
                Ange dina uppgifter för att fortsätta.
              </p>
            </div>

            {error && (
              <div
                className="alert alert-danger border-0 mb-4"
                ref={errRef}
                role="alert"
                style={{
                  borderRadius: "12px",
                  backgroundColor: "rgba(255,0,0,0.05)",
                  color: "#d32f2f",
                }}
                tabIndex={-1}
              >
                {error}
              </div>
            )}

            <Form onSubmit={handleSubmit} noValidate>
              <Form.Group className="mb-3">
                <div className="position-relative">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="position-absolute translate-middle-y top-50 ms-3 text-muted"
                  />
                  <Form.Control
                    type="email"
                    placeholder="E-postadress"
                    className="py-3 ps-5 border-0 shadow-sm"
                    style={{
                      borderRadius: "12px",
                    }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <div className="position-relative">
                  <FontAwesomeIcon
                    icon={faLock}
                    className="position-absolute translate-middle-y top-50 ms-3 text-muted"
                  />
                  <Form.Control
                    type="password"
                    placeholder="Lösenord"
                    className="py-3 ps-5 border-0 shadow-sm"
                    style={{
                      borderRadius: "12px",
                      color: "black",
                    }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </Form.Group>

              <div className="d-grid gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary btn-lg py-3 rounded-3 fw-bold shadow-sm"
                >
                  {isLoading ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    "LOGGA IN"
                  )}
                </button>
              </div>
            </Form>

            <div className="mt-4 text-center">
              <Link
                to="/forgot-password"
                className="text-decoration-none small text-muted"
              >
                Glömt lösenord?
              </Link>
              <hr className="my-4 opacity-25" />
              <p className="small text-muted mb-0">
                Har du inget konto?{" "}
                <Link
                  to="/register"
                  className="fw-bold text-primary text-decoration-none"
                >
                  Skapa ett här
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginMail;
