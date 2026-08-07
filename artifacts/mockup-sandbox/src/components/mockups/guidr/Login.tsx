import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link, useLocation } from "./_shared/router";
import { AuthHeader } from "./_shared";
import "./_group.css";

const egyptianCities = [
  "Cairo",
  "Alexandria",
  "Giza",
  "Qalyubia",
  "Port Said",
  "Suez",
  "Luxor",
  "Aswan",
  "Mansoura",
  "Tanta",
  "Ismailia",
  "Other",
];

export function Login() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    city: "",
    email: "",
    password: "",
  });

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

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
          width: "min(520px, calc(100% - 40px))",
          margin: "6vh auto",
          paddingBottom: 40,
        }}
      >
        <div className="g-label">Welcome back</div>
        <h1 style={{ fontSize: 40, margin: "12px 0 10px" }}>
          Log in<span style={{ color: "var(--g-red)" }}>.</span>
        </h1>
        <p style={{ color: "#9b9995", fontSize: 12, margin: "0 0 28px" }}>
          Tell us a little about you so Guidr can make the right introductions.
        </p>

        <div style={{ display: "grid", gap: 15 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <label className="field">
              First name
              <input
                required
                value={form.firstName}
                onChange={(event) =>
                  updateField("firstName", event.target.value)
                }
                placeholder="Mohamed"
                autoComplete="given-name"
              />
            </label>
            <label className="field">
              Last name
              <input
                required
                value={form.lastName}
                onChange={(event) =>
                  updateField("lastName", event.target.value)
                }
                placeholder="Ali"
                autoComplete="family-name"
              />
            </label>
          </div>

          <label className="field">
            Phone number
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+20 10 1234 5678"
              autoComplete="tel"
            />
          </label>

          <label className="field" style={{ position: "relative" }}>
            City
            <select
              required
              value={form.city}
              onChange={(event) => updateField("city", event.target.value)}
              style={{ appearance: "none", paddingRight: 38 }}
            >
              <option value="" disabled>
                Select your city
              </option>
              {egyptianCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              aria-hidden="true"
              style={{
                position: "absolute",
                right: 12,
                bottom: 11,
                color: "#9b9995",
                pointerEvents: "none",
              }}
            />
          </label>

          <label className="field">
            Email address
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="you@school.edu"
              autoComplete="email"
            />
          </label>

          <label className="field">
            Password
            <input
              required
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
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