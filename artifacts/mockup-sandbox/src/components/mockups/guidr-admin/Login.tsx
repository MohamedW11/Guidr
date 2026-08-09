import { useState } from "react";
import { ArrowRight, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "../guidr/_shared/router";
import { AdminBrand } from "./_shared/AdminShell";
import { useAuth } from "../../../lib/AuthContext";
import "./_group.css";

export function Login() {
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { refetchUser } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

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
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { message: "Server error or database connection failed. Please check DATABASE_URL." };
      }

      if (!res.ok) {
        throw new Error(data.message || "Admin login failed");
      }

      if (data.role !== "admin") {
        throw new Error("Account is not an administrator account");
      }

      await refetchUser();
      setLocation("/guidr-admin/Dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid admin credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ga-auth ga">
      <header style={{ padding: "24px 32px" }}>
        <AdminBrand />
      </header>
      <main style={{ width: "min(440px,calc(100% - 40px))", margin: "10vh auto", paddingBottom: 30 }}>
        <Link
          href="/guidr/Login"
          style={{ color: "#aaa", fontSize: 11, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <ArrowLeft size={13} /> Back to student portal
        </Link>
        <div style={{ marginTop: 56 }}>
          <div className="ga-label">Internal access</div>
          <h1 style={{ fontSize: 38, margin: "11px 0 10px" }}>
            Good work starts here<span style={{ color: "#bd3b3f" }}>.</span>
          </h1>
          <p style={{ fontSize: 12, color: "#999", lineHeight: 1.6, marginBottom: 30 }}>
            Manage the opportunities and learning paths that help Egypt's students make their next move.
          </p>

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

          <form onSubmit={submit}>
            <label className="ga-field">
              Work email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@guidred.org"
                required
              />
            </label>
            <label className="ga-field" style={{ position: "relative" }}>
              Password
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{ paddingRight: 42 }}
              />
              <button
                type="button"
                className="ga-icon"
                onClick={() => setShow(!show)}
                style={{ position: "absolute", right: 5, bottom: 2, color: "#aaa" }}
              >
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </label>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#aaa", margin: "7px 0 22px" }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  style={{ accentColor: "var(--ga-red)" }}
                />{" "}
                Remember me
              </label>
              <button
                type="button"
                className="ga-icon"
                onClick={() => alert("Contact system administrator to reset credentials.")}
                style={{ color: "#bd3b3f" }}
              >
                Forgot password?
              </button>
            </div>
            <button className="ga-btn red" type="submit" disabled={isSubmitting} style={{ width: "100%", height: 44 }}>
              {isSubmitting ? "Authenticating..." : "Enter admin workspace"} <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </main>
      <footer style={{ marginTop: "auto", padding: "20px 32px", fontSize: 10, color: "#666", borderTop: "1px solid #292929" }}>
        Guidr Admin · Opportunity catalog & Guidr Tutor curriculum
      </footer>
    </div>
  );
}