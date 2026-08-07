import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link, useLocation } from "./_shared/router";
import { AuthHeader } from "./_shared";
import "./_group.css";

const cities = [
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

const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const interests = [
  "Leadership",
  "Science",
  "Technology",
  "Business",
  "Writing",
  "Research",
];

type FormState = {
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  country: string;
  city: string;
  grade: string;
  interests: string;
  email: string;
  password: string;
};

export function Signup() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    displayName: "",
    phone: "",
    country: "Egypt",
    city: "",
    grade: "",
    interests: "",
    email: "",
    password: "",
  });

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const selectStyle = { appearance: "none" as const, paddingRight: 36 };

  return (
    <div className="auth guidr" style={{ overflowY: "auto" }}>
      <AuthHeader
        right={
          <Link href="/guidr/Login" style={{ color: "#fefcfa", fontSize: 12 }}>
            Log in
          </Link>
        }
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setLocation("/guidr/Onboarding");
        }}
        style={{
          width: "min(620px, calc(100% - 40px))",
          margin: "5vh auto",
          paddingBottom: 44,
        }}
      >
        <div className="g-label">Your next move starts here</div>
        <h1 style={{ fontSize: 40, lineHeight: 1, margin: "12px 0 8px" }}>
          Create your account<span style={{ color: "var(--g-red)" }}>.</span>
        </h1>
        <p style={{ color: "#9b9995", fontSize: 12, margin: "0 0 28px" }}>
          A few details help Guidr show you opportunities that fit.
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
                onChange={(event) => update("firstName", event.target.value)}
                placeholder="Mohamed"
                autoComplete="given-name"
              />
            </label>
            <label className="field">
              Last name
              <input
                required
                value={form.lastName}
                onChange={(event) => update("lastName", event.target.value)}
                placeholder="Ali"
                autoComplete="family-name"
              />
            </label>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <label className="field">
              Display name
              <input
                required
                value={form.displayName}
                onChange={(event) =>
                  update("displayName", event.target.value)
                }
                placeholder="Mohamed A."
                autoComplete="nickname"
              />
            </label>
            <label className="field">
              Phone number
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
                placeholder="+20 10 1234 5678"
                autoComplete="tel"
              />
            </label>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <label className="field" style={{ position: "relative" }}>
              Country
              <select
                required
                value={form.country}
                onChange={(event) => update("country", event.target.value)}
                style={selectStyle}
              >
                <option value="Egypt">Egypt</option>
                <option value="Other">Other</option>
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
            <label className="field" style={{ position: "relative" }}>
              City
              <select
                required
                value={form.city}
                onChange={(event) => update("city", event.target.value)}
                style={selectStyle}
              >
                <option value="" disabled>
                  Select your city
                </option>
                {cities.map((city) => (
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
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <label className="field" style={{ position: "relative" }}>
              Grade
              <select
                required
                value={form.grade}
                onChange={(event) => update("grade", event.target.value)}
                style={selectStyle}
              >
                <option value="" disabled>
                  Select your grade
                </option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
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
            <label className="field" style={{ position: "relative" }}>
              Main interest
              <select
                required
                value={form.interests}
                onChange={(event) => update("interests", event.target.value)}
                style={selectStyle}
              >
                <option value="" disabled>
                  Choose an interest
                </option>
                {interests.map((interest) => (
                  <option key={interest} value={interest}>
                    {interest}
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
          </div>

          <label className="field">
            Email address
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
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
              onChange={(event) => update("password", event.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </label>

          <button className="g-btn red" type="submit">
            Continue <ArrowRight size={14} />
          </button>
        </div>

        <p style={{ fontSize: 11, color: "#9b9995", marginTop: 18 }}>
          Already have an account?{" "}
          <Link href="/guidr/Login" style={{ color: "#fefcfa" }}>
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}