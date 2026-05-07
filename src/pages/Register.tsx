import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

// Firebase
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import {
  doc,
  setDoc,
  query,
  where,
  getDocs,
  collection,
} from "firebase/firestore";

import "../index.css";

// Regex från din template
const USER_REGEX = /^[A-Öa-ö][A-z0-9-_åäöÅÄÖ]{3,23}$/;
const PWD_REGEX =
  /^(?=.*[a-zåäö])(?=.*[A-ÖÅÄÖ])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register = () => {
  const navigate = useNavigate();
  const errRef = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [valid, setValid] = useState({
    username: false,
    email: false,
    password: false,
    match: false,
    usernameTaken: false,
  });

  const [focus, setFocus] = useState({
    user: false,
    email: false,
    pwd: false,
    match: false,
  });

  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // Validerings-effekt
  useEffect(() => {
    setValid({
      username: USER_REGEX.test(formData.username),
      email: EMAIL_REGEX.test(formData.email),
      password: PWD_REGEX.test(formData.password),
      match:
        formData.password === formData.confirmPassword &&
        formData.confirmPassword !== "",
      usernameTaken: false, // Återställs vid ändring
    });
  }, [formData]);

  const handleChange = (e: { target: { name: string; value: any } }) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    // Sista säkerhetskollen innan skick
    const v1 = USER_REGEX.test(formData.username);
    const v2 = PWD_REGEX.test(formData.password);
    const v3 = EMAIL_REGEX.test(formData.email);
    if (!v1 || !v2 || !v3 || formData.password !== formData.confirmPassword) {
      setErrMsg("Ogiltig inmatning");
      return;
    }

    setLoading(true);
    setErrMsg("");

    try {
      // 1. Kolla om användarnamnet finns i Firestore
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("displayName_lowercase", "==", formData.username.toLowerCase()),
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setValid((prev) => ({ ...prev, usernameTaken: true }));
        setErrMsg("Användarnamnet är upptaget.");
        setLoading(false);
        return;
      }

      // 2. Skapa användare i Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );

      // 3. Uppdatera profil och spara i Firestore
      await updateProfile(userCredential.user, {
        displayName: formData.username,
      });

      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        displayName: formData.username,
        displayName_lowercase: formData.username.toLowerCase(),
        email: formData.email,
        createdAt: new Date(),
        photoURL: "/default-avatar.png",
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setErrMsg("E-postadressen används redan.");
      } else {
        setErrMsg("Registreringen misslyckades.");
      }
      errRef.current?.focus();
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
                <span className="h2 text-white mb-0">✨</span>
              </div>
              <h1 className="h3 fw-bold text-dark">Skapa konto</h1>
            </div>

            {errMsg && (
              <div
                ref={errRef}
                className="alert alert-danger py-2 small rounded-3"
                aria-live="assertive"
              >
                {errMsg}
              </div>
            )}

            <Form onSubmit={handleRegister} className="d-grid gap-3">
              {/* ANVÄNDARNAMN */}
              <div className="form-group">
                <Form.Label className="d-flex justify-content-between">
                  <span>Användarnamn</span>
                  <span>
                    {valid.username && (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-success"
                      />
                    )}
                    {!valid.username && formData.username && (
                      <FontAwesomeIcon icon={faTimes} className="text-danger" />
                    )}
                  </span>
                </Form.Label>
                <Form.Control
                  name="username"
                  placeholder="Användarnamn"
                  className={`bg-light border-0 py-3 rounded-3 shadow-sm ${valid.usernameTaken ? "is-invalid" : ""}`}
                  onChange={handleChange}
                  onFocus={() => setFocus({ ...focus, user: true })}
                  onBlur={() => setFocus({ ...focus, user: false })}
                  isInvalid={valid.usernameTaken}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Namnet är upptaget.
                </Form.Control.Feedback>
                {focus.user && !valid.username && formData.username && (
                  <div className="alert alert-info p-2 mt-2 small">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    Börjar med en bokstav. 4-24 tecken. Bokstäver, siffror, -
                    och _ tillåtna.
                  </div>
                )}
              </div>

              {/* E-POST */}
              <div className="form-group">
                <Form.Label className="d-flex justify-content-between">
                  <span>E-postadress</span>
                  <span>
                    {valid.email && (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-success"
                      />
                    )}
                    {!valid.email && formData.email && (
                      <FontAwesomeIcon icon={faTimes} className="text-danger" />
                    )}
                  </span>
                </Form.Label>
                <Form.Control
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className="bg-light border-0 py-3 rounded-3 shadow-sm"
                  onChange={handleChange}
                  onFocus={() => setFocus({ ...focus, email: true })}
                  onBlur={() => setFocus({ ...focus, email: false })}
                  required
                />
              </div>

              {/* LÖSENORD */}
              <div className="form-group">
                <Form.Label className="d-flex justify-content-between">
                  <span>Lösenord</span>
                  <span>
                    {valid.password && (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-success"
                      />
                    )}
                    {!valid.password && formData.password && (
                      <FontAwesomeIcon icon={faTimes} className="text-danger" />
                    )}
                  </span>
                </Form.Label>
                <Form.Control
                  name="password"
                  type="password"
                  placeholder="Lösenord"
                  className="bg-light border-0 py-3 rounded-3 shadow-sm"
                  onChange={handleChange}
                  onFocus={() => setFocus({ ...focus, pwd: true })}
                  onBlur={() => setFocus({ ...focus, pwd: false })}
                  required
                />
                {focus.pwd && !valid.password && (
                  <div className="alert alert-info p-2 mt-2 small">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    8–24 tecken. Inkludera stor & liten bokstav, siffra och
                    specialtecken (!@#$%).
                  </div>
                )}
              </div>

              {/* BEKRÄFTA LÖSENORD */}
              <div className="form-group">
                <Form.Label className="d-flex justify-content-between">
                  <span>Bekräfta lösenord</span>
                  <span>
                    {valid.match && formData.confirmPassword && (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-success"
                      />
                    )}
                    {!valid.match && formData.confirmPassword && (
                      <FontAwesomeIcon icon={faTimes} className="text-danger" />
                    )}
                  </span>
                </Form.Label>
                <Form.Control
                  name="confirmPassword"
                  type="password"
                  placeholder="Bekräfta lösenord"
                  className="bg-light border-0 py-3 rounded-3 shadow-sm"
                  onChange={handleChange}
                  onFocus={() => setFocus({ ...focus, match: true })}
                  onBlur={() => setFocus({ ...focus, match: false })}
                  required
                />
                {focus.match && !valid.match && (
                  <div className="alert alert-info p-2 mt-2 small">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    Måste matcha lösenordet ovan.
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  !valid.username ||
                  !valid.password ||
                  !valid.match ||
                  !valid.email
                }
                className="btn btn-primary btn-lg py-3 rounded-3 fw-bold shadow-sm mt-3"
              >
                {loading ? <Spinner size="sm" /> : "REGISTRERA MIG"}
              </button>
            </Form>

            <div className="mt-4 text-center">
              <p className="small text-muted mb-0">
                Har du redan ett konto?{" "}
                <Link
                  to="/login"
                  className="fw-bold text-primary text-decoration-none"
                >
                  Logga in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
