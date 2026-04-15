import { Link } from "react-router-dom";
function LandingPage() {
  return (
    <>
      <section id="center">
        <div>
          <h1>Event Me!</h1>
          <h2>Create your events and share with friends!</h2>
          <Link to="/login" className="btn btn-primary btn-lg">
            Logga in med Facebook
          </Link>
          <Link to="/signup" className="btn btn-secondary btn-lg">
            Sign up
          </Link>
        </div>
      </section>
    </>
  );
}

export default LandingPage;
