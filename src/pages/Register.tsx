import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Spinner } from "react-bootstrap";

// Firebase (Antar att dessa är konfigurerade)
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

const Register = () => {
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // Validering och Logic (behålls från tidigare)
  useEffect(() => {
    const USER_REGEX = /^[A-Öa-ö][A-z0-9-_åäöÅÄÖ]{3,23}$/;
    const PWD_REGEX =
      /^(?=.*[a-zåäö])(?=.*[A-ÖÅÄÖ])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    setValid({
      username: USER_REGEX.test(formData.username),
      email: EMAIL_REGEX.test(formData.email),
      password: PWD_REGEX.test(formData.password),
      match:
        formData.password === formData.confirmPassword &&
        formData.confirmPassword !== "",
      usernameTaken: false,
    });
  }, [formData]);

  const handleChange = (e: any) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setErrMsg("");
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("displayName_lowercase", "==", formData.username.toLowerCase()),
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setValid((prev) => ({ ...prev, usernameTaken: true }));
        setLoading(false);
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );
      await updateProfile(userCredential.user, {
        displayName: formData.username,
      });
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        displayName: formData.username,
        displayName_lowercase: formData.username.toLowerCase(), // Här blir det garanterat rätt
        email: formData.email,
        createdAt: new Date(),
      });
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      // Kolla specifika Firebase-fel
      if ((err as { code?: string }).code === "auth/email-already-in-use") {
        setErrMsg("E-postadressen används redan.");
      } else if ((err as { code?: string }).code === "auth/weak-password") {
        setErrMsg("Lösenordet är för svagt.");
      } else {
        setErrMsg("Ett oväntat fel uppstod. Försök igen senare.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center bg-dark min-vh-100 py-4">
      <div className="row w-100 justify-content-center">
        {/* Samma bredd-klasser som Login: col-lg-4 etc */}
        <div className="col-12 col-sm-8 col-md-6 col-lg-4">
          <div className="card border-0 shadow-lg p-4 p-md-5 rounded-4">
            {/* Header - Samma stil som Login */}
            <div className="text-center mb-4">
              <div className="bg-primary d-inline-block p-3 rounded-circle mb-3 shadow-sm">
                <span className="h2 text-white mb-0">✨</span>
              </div>
              <h1 className="h3 fw-bold text-dark">Skapa konto</h1>
              <p className="text-muted">Börja planera dina events idag.</p>
            </div>

            {errMsg && (
              <div className="alert alert-danger py-2 small rounded-3">
                {errMsg}
              </div>
            )}

            <Form onSubmit={handleRegister} className="d-grid gap-3">
              {/* Användarnamn */}
              <div className="form-group mb-3">
                {" "}
                {/* La till lite marginal här */}
                <Form.Control
                  name="username"
                  placeholder="Användarnamn"
                  /* Här lägger vi till is-invalid om namnet är upptaget */
                  className={`bg-light border-0 py-3 rounded-3 shadow-sm ${valid.usernameTaken ? "is-invalid" : ""}`}
                  onChange={handleChange}
                  isInvalid={valid.usernameTaken} // Bootstraps inbyggda prop för detta
                  required
                />
                <Form.Control.Feedback type="invalid" className="ps-2">
                  Namnet är tyvärr upptaget.
                </Form.Control.Feedback>
              </div>

              {/* E-post */}
              <div className="form-group">
                <Form.Control
                  name="email"
                  type="email"
                  placeholder="E-postadress"
                  className="bg-light border-0 py-3 rounded-3 shadow-sm"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Lösenord */}
              <div className="form-group">
                <Form.Control
                  name="password"
                  type="password"
                  placeholder="Lösenord"
                  className="bg-light border-0 py-3 rounded-3 shadow-sm"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Bekräfta Lösenord */}
              <div className="form-group mb-2">
                <Form.Control
                  name="confirmPassword"
                  type="password"
                  placeholder="Bekräfta lösenord"
                  className="bg-light border-0 py-3 rounded-3 shadow-sm"
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={
                  loading || !valid.username || !valid.password || !valid.match
                }
                className="btn btn-primary btn-lg py-3 rounded-3 fw-bold shadow-sm"
              >
                {loading ? <Spinner size="sm" /> : "REGISTRERA MIG"}
              </button>
            </Form>

            {/* Footer - Samma stil som Login */}
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

          <p className="text-center text-white mt-4 small">
            &copy; 2026 EventApp AB
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
