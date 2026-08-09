import { useState } from "react";
import { ArrowRight, ChevronDown, Check } from "lucide-react";
import { Link, useLocation } from "./_shared/router";
import { AuthHeader } from "./_shared";
import { useAuth } from "../../../lib/AuthContext";
import { EGYPTIAN_GOVERNORATES, STUDENT_INTERESTS } from "../../../lib/governorates";
import "./_group.css";

const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];

export function Signup() {
  const [, setLocation] = useLocation();
  const { refetchUser } = useAuth();
  const [step, setStep] = useState(1);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [school, setSchool] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((current) =>
      current.includes(interest) ? current.filter((i) => i !== interest) : [...current, interest],
    );
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!firstName || !lastName || !governorate || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    setError(null);
    if (selectedGrade === null) {
      setError("Please select your grade.");
      return;
    }
    setStep(3);
  };

  const handleFinalSignup = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          phone,
          school,
          governorate,
          grade: selectedGrade,
          interests: selectedInterests,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      await refetchUser();
      setLocation("/guidr/Dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to register account");
    } finally {
      setIsSubmitting(false);
    }
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
      <div
        style={{
          width: "min(620px, calc(100% - 40px))",
          margin: "5vh auto",
          paddingBottom: 44,
        }}
      >
        <div style={{ height: 3, background: "#2a2a2a", borderRadius: 2, marginBottom: 24 }}>
          <div
            style={{
              height: 3,
              width: `${(step / 3) * 100}%`,
              background: "var(--g-red)",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <div className="g-label">Step {step} of 3</div>
        <h1 style={{ fontSize: "clamp(24px, 5vw, 40px)", lineHeight: 1.1, margin: "8px 0 8px" }}>
          {step === 1 && "Create your account."}
          {step === 2 && "Select your grade."}
          {step === 3 && "Choose your interests."}
        </h1>
        <p style={{ color: "#9b9995", fontSize: 12, margin: "0 0 28px" }}>
          {step === 1 && "Start by filling in your basic personal and contact details."}
          {step === 2 && "This helps us show opportunities matching your eligibility."}
          {step === 3 && "Select the subjects and areas you are curious about."}
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
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleNextStep1} style={{ display: "grid", gap: 15 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <label className="field">
                First name *
                <input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Omar"
                />
              </label>
              <label className="field">
                Last name *
                <input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Hassan"
                />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <label className="field">
                Email address *
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="omar@school.edu"
                />
              </label>
              <label className="field">
                Password *
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <label className="field">
                Phone number
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+20 120 000 0000"
                />
              </label>
              <label className="field">
                School name
                <input
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="STEM High School"
                />
              </label>
            </div>

            <label className="field" style={{ position: "relative" }}>
              Governorate (Egypt) *
              <select
                required
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                style={selectStyle}
              >
                <option value="" disabled>
                  Select governorate (27 options)
                </option>
                {EGYPTIAN_GOVERNORATES.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
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

            <button className="g-btn red" type="submit" style={{ marginTop: 12 }}>
              Next: Select Grade <ArrowRight size={14} />
            </button>
          </form>
        )}

        {step === 2 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[9, 10, 11, 12].map((g) => {
                const isSelected = selectedGrade === g;
                return (
                  <button
                    key={g}
                    type="button"
                    className="g-btn"
                    onClick={() => setSelectedGrade(g)}
                    style={{
                      borderColor: isSelected ? "var(--g-red)" : undefined,
                      background: isSelected ? "var(--g-red)" : undefined,
                      color: isSelected ? "var(--g-paper)" : undefined,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      height: 52,
                      fontSize: 15,
                    }}
                  >
                    Grade {g}
                    {isSelected && <Check size={16} />}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                className="g-btn"
                onClick={() => setStep(1)}
                style={{ flex: 1 }}
              >
                Back
              </button>
              <button
                type="button"
                className="g-btn red"
                onClick={handleNextStep2}
                style={{ flex: 2 }}
              >
                Next: Select Interests <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 10,
                marginBottom: 24,
                maxHeight: 320,
                overflowY: "auto",
                paddingRight: 6,
              }}
            >
              {STUDENT_INTERESTS.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    className="g-btn"
                    onClick={() => toggleInterest(interest)}
                    style={{
                      borderColor: isSelected ? "var(--g-red)" : undefined,
                      background: isSelected ? "var(--g-red)" : undefined,
                      color: isSelected ? "var(--g-paper)" : undefined,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      minHeight: 48,
                      fontSize: 13,
                      textAlign: "left",
                    }}
                  >
                    {interest}
                    {isSelected && <Check size={14} />}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                className="g-btn"
                onClick={() => setStep(2)}
                style={{ flex: 1 }}
              >
                Back
              </button>
              <button
                type="button"
                className="g-btn red"
                disabled={isSubmitting}
                onClick={handleFinalSignup}
                style={{ flex: 2 }}
              >
                {isSubmitting ? "Creating account..." : "Complete Setup"} <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}