import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faInfoCircle,
  faLock,
  faUser,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

// Firebase
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// Regex för validering
const USER_REGEX = /^[A-Öa-ö][A-z0-9-_åäöÅÄÖ]{3,23}$/;
const PWD_REGEX =
  /^(?=.*[a-zåäö])(?=.*[A-ÖÅÄÖ])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register = () => {
  const navigate = useNavigate();

  // Form States
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Validation States
  const [valid, setValid] = useState({
    username: false,
    email: false,
    password: false,
    match: false,
  });

  // UI States
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // Kör validering varje gång fälten ändras
  useEffect(() => {
    setValid({
      username: USER_REGEX.test(formData.username),
      email: EMAIL_REGEX.test(formData.email),
      password: PWD_REGEX.test(formData.password),
      match:
        formData.password === formData.confirmPassword &&
        formData.confirmPassword !== "",
    });
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrMsg(""); // Rensa felmeddelande när användaren skriver
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid.username || !valid.email || !valid.password || !valid.match)
      return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.username });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: formData.username,
        displayName_lowercase: formData.username.toLowerCase(), // Spara som små bokstäver
        email: formData.email,
        photoURL: "",
        createdAt: new Date(),
      });

      navigate("/dashboard");
    } catch (err: any) {
      setLoading(false);
      console.error("Firebase Error Code:", err.code); // Logga koden (t.ex. auth/email-already-in-use)
      console.error("Firebase Full Error:", err); // Logga hela objektet
      if (err.code === "auth/email-already-in-use")
        setErrMsg("E-postadressen används redan.");
      else setErrMsg("Registreringen misslyckades. Försök igen senare.");
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={5}>
          <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="bg-primary p-4 text-center text-white">
              <h2 className="fw-bold mb-0">Skapa Konto</h2>
              <p className="small opacity-75">Börja planera dina events idag</p>
            </div>

            <Card.Body className="p-4 p-md-5 bg-white">
              {errMsg && (
                <Alert variant="danger" className="py-2 small">
                  {errMsg}
                </Alert>
              )}

              <Form onSubmit={handleRegister}>
                {/* ANVÄNDARNAMN */}
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">
                    Användarnamn
                  </Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text className="bg-light border-end-0">
                      <FontAwesomeIcon icon={faUser} className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      name="username"
                      placeholder="t.ex. Johan88"
                      className="bg-light border-start-0"
                      onChange={handleChange}
                      required
                    />
                    <InputGroup.Text className="bg-light border-start-0">
                      {formData.username && (
                        <FontAwesomeIcon
                          icon={valid.username ? faCheck : faTimes}
                          className={
                            valid.username ? "text-success" : "text-danger"
                          }
                        />
                      )}
                    </InputGroup.Text>
                  </InputGroup>
                  {!valid.username && formData.username && (
                    <Form.Text className="text-danger small">
                      4-24 tecken. Börja med bokstav.
                    </Form.Text>
                  )}
                </Form.Group>

                {/* E-POST */}
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">E-post</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0">
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className="text-muted"
                      />
                    </InputGroup.Text>
                    <Form.Control
                      name="email"
                      type="email"
                      placeholder="din@mejl.se"
                      className="bg-light border-start-0"
                      onChange={handleChange}
                      required
                    />
                  </InputGroup>
                </Form.Group>

                {/* LÖSENORD */}
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Lösenord</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0">
                      <FontAwesomeIcon icon={faLock} className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      name="password"
                      type="password"
                      placeholder="********"
                      className="bg-light border-start-0"
                      onChange={handleChange}
                      required
                    />
                  </InputGroup>
                  {!valid.password && formData.password && (
                    <Form.Text className="text-muted small d-block">
                      <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                      Måste innehålla: 8+ tecken, stor bokstav, siffra & symbol.
                    </Form.Text>
                  )}
                </Form.Group>

                {/* BEKRÄFTA LÖSENORD */}
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold">
                    Bekräfta Lösenord
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0">
                      <FontAwesomeIcon icon={faLock} className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      name="confirmPassword"
                      type="password"
                      placeholder="********"
                      className="bg-light border-start-0"
                      onChange={handleChange}
                      required
                    />
                  </InputGroup>
                  {!valid.match && formData.confirmPassword && (
                    <Form.Text className="text-danger small">
                      Lösenorden matchar inte.
                    </Form.Text>
                  )}
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 py-2 fw-bold shadow-sm"
                  disabled={
                    loading ||
                    !valid.username ||
                    !valid.password ||
                    !valid.match
                  }
                >
                  {loading ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    "REGISTRERA MIG"
                  )}
                </Button>
              </Form>

              <div className="text-center mt-4">
                <p className="small text-muted mb-0">Har du redan ett konto?</p>
                <Link
                  to="/login"
                  className="text-primary fw-bold text-decoration-none small"
                >
                  Logga in här
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
