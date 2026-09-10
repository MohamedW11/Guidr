import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { AuthHeader } from "./_shared";
import { useAuth } from "../../../lib/AuthContext";
import "./_group.css";

export function Login() {
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

      let data: any = {};
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { message: text || "Server authentication error." };
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to log in");
      }

      await refetchUser();

      if (data.organizations && data.organizations.length > 1) {
        window.location.href = "/select-organization";
      } else if (data.organizations && data.organizations.length === 1) {
        window.location.href = `/${data.organizations[0].slug}/dashboard`;
      } else {
        window.location.href = "/select-organization";
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth guidr">
      <AuthHeader
        right={
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ color: "#9b9995", fontSize: 12 }}>Guidr V1 Multi-Tenant Platform</span>
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

        <div style={{ marginTop: 24, padding: 16, background: "rgba(255,255,255,0.03)", borderRadius: 8, fontSize: 12, color: "#9b9995" }}>
          <p style={{ fontWeight: 600, color: "#fff", marginBottom: 6 }}>Demo Test Accounts:</p>
          <p>• Admin: <code>admin@guidred.org</code> / <code>AdminPass123!</code></p>
          <p>• Advisor: <code>advisor@guidred.org</code> / <code>AdvisorPass123!</code></p>
          <p>• Student: <code>student@guidred.org</code> / <code>StudentPass123!</code></p>
          <p>• Parent: <code>parent@guidred.org</code> / <code>ParentPass123!</code></p>
        </div>
      </form>
    </div>
  );
}