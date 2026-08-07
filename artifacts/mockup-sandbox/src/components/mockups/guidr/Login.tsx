import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "./_shared/router";
import { AuthHeader } from "./_shared";
import "./_group.css";

export function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="auth guidr">
      <AuthHeader
        right={
          <Link
            href="/guidr/Signup"
            style={{ color: "#fefcfa", fontSize: 12 }}
          >
            Create account
          </Link>
        }
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setLocation("/guidr/Dashboard");
        }}
        style={{
          width: "min(390px, calc(100% - 40px))",
          margin: "10vh auto",
        }}
      >
        <div className="g-label">Welcome back</div>
        <h1 style={{ fontSize: 40, margin: "12px 0 32px" }}>
          Log in<span style={{ color: "var(--g-red)" }}>.</span>
        </h1>
        <div style={{ display: "grid", gap: 18 }}>
          <label className="field">
            Email address
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@school.edu"
              autoComplete="email"
            />
          </label>
          <label className="field">
            Password
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>
          <button className="g-btn red" type="submit">
            Log in <ArrowRight size={14} />
          </button>
        </div>
        <p style={{ fontSize: 11, color: "#9b9995", marginTop: 22 }}>
          New to Guidr?{" "}
          <Link href="/guidr/Signup" style={{ color: "#fefcfa" }}>
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}