import { Link } from "./_shared/router";
import "./_group.css";

export function Landing() {
  return (
    <div className="auth guidr">
      <header
        style={{
          padding: "24px 32px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <b>
          <span className="mark" style={{ display: "inline-grid", marginRight: 8 }}>
            g
          </span>
          guidr
        </b>
        <div style={{ display: "flex", gap: 20, fontSize: 12 }}>
          <Link href="/guidr/Login" style={{ color: "#fefcfa", textDecoration: "none" }}>
            Log in
          </Link>
          <Link href="/guidr/Signup" style={{ color: "#fefcfa", textDecoration: "none" }}>
            Sign up
          </Link>
        </div>
      </header>
      <section
        style={{
          flex: 1,
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          padding: "10vh 24px",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(42px, 8vw, 92px)",
            maxWidth: 850,
            lineHeight: 0.98,
            margin: "0 auto",
            fontFamily: "Space Grotesk",
          }}
        >
          Hello I Am Guidr
          <br />
          And Here To Help You<span style={{ color: "var(--g-red)" }}>.</span>
        </h1>
      </section>
    </div>
  );
}