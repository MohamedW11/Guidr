import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "./_shared/router";
import { AuthHeader } from "./_shared";
import { useAuth } from "../../../lib/AuthContext";
import "./_group.css";

export function Login() {
  const [, setLocation] = useLocation();
  const { refetchUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to log in");
      }

      await refetchUser();
      if (data.role === "admin") {
        setLocation("/guidr-admin/Dashboard");
      } else {
        setLocation("/guidr/Dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth guidr">
      <AuthHeader
        right={
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Link
              href="/guidr-admin/Login"
              style={{ color: "var(--g-red)", fontSize: 12, textDecoration: "none" }}
            >
              Admin Portal
            </Link>
            <Link href="/guidr/Signup" style={{ color: "#ffffff", fontSize: 12 }}>
              Create account
            </Link>
          </div>
        }
      />
      <form
        onSubmit={handleSubmit}
        style={{
          width: "min(390px, calc(100% - 40px))",
          margin: "10vh auto",
        }}
      >
        <div className="g-label">Welcome back</div>
        <h1 style={{ fontSize: 40, margin: "12px 0 32px" }}>
          Log in<span style={{ color: "var(--g-red)" }}>.</span>
        </h1>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(220, 38, 38, 0.15)",
              border: "1px solid rgba(220, 38, 38, 0.4)",
              borderRadius: 6,
              color: "#f87171",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

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
          <button className="g-btn red" type="submit" disabled={isSubmitting} style={{ width: "100%" }}>
            {isSubmitting ? "Logging in..." : "Log in"} <ArrowRight size={14} />
          </button>
        </div>
        <div style={{ marginTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
          <p style={{ color: "#9b9995", margin: 0 }}>
            New to Guidr?{" "}
            <Link href="/guidr/Signup" style={{ color: "#ffffff" }}>
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}