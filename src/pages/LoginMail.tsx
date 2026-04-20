import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faEnvelope } from "@fortawesome/free-solid-svg-icons";

const LoginMail = () => {
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

  // --- Inline Styling ---
  const styles = {
    wrapper: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative" as const,
      overflow: "hidden",
    },
    overlay: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      backdropFilter: "blur(15px)",
      WebkitBackdropFilter: "blur(15px)",
      zIndex: 0,
    },
    loginBox: {
      position: "relative" as const,
      zIndex: 2,
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "20px",
      padding: "40px",
      width: "100%",
      maxWidth: "450px",
      color: "white",
    },
    inputWrapper: {
      position: "relative" as const,
      marginBottom: "25px",
    },
    icon: {
      position: "absolute" as const,
      left: "15px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "rgba(255, 255, 255, 0.5)",
      zIndex: 10,
    },
    input: {
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "10px",
      color: "white",
      paddingLeft: "45px",
      height: "50px",
    },
    button: {
      height: "50px",
      borderRadius: "10px",
      fontWeight: "bold",
      fontSize: "1.1rem",
      marginTop: "10px",
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.overlay} aria-hidden="true" />

      <div style={styles.loginBox}>
        <h2 className="text-center mb-4 fw-bold">Logga in</h2>

        {error && (
          <div
            className="alert alert-danger"
            ref={errRef}
            role="alert"
            style={{ borderRadius: "10px", fontSize: "0.9rem" }}
            tabIndex={-1}
          >
            {error}
          </div>
        )}

        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group style={styles.inputWrapper}>
            <FontAwesomeIcon icon={faEnvelope} style={styles.icon} />
            <Form.Control
              type="email"
              placeholder="E-postadress"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group style={styles.inputWrapper}>
            <FontAwesomeIcon icon={faLock} style={styles.icon} />
            <Form.Control
              type="password"
              placeholder="Lösenord"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <div className="d-grid gap-3">
            <Button
              variant="light"
              style={styles.button}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? <Spinner size="sm" animation="border" /> : "LOGGA IN"}
            </Button>

            <div className="text-center mt-3 d-flex justify-content-between">
              <Link to="/register" style={{ color: "#aaa", textDecoration: "none", fontSize: "0.85rem" }}>
                Skapa konto
              </Link>
              <Link to="/forgot-password" style={{ color: "#aaa", textDecoration: "none", fontSize: "0.85rem" }}>
                Glömt lösenord?
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default LoginMail;