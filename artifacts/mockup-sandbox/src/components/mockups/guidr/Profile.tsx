import { useState, useEffect } from "react";
import { Shell } from "./_shared";
import { useAuth } from "../../../lib/AuthContext";
import { STUDENT_INTERESTS, EGYPTIAN_GOVERNORATES } from "../../../lib/governorates";
import { LogOut } from "lucide-react";
import { useLocation } from "./_shared/router";
import "./_group.css";

export function Profile() {
  const { user, logout, refetchUser } = useAuth();
  const [, setLocation] = useLocation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [school, setSchool] = useState("");
  const [governorate, setGovernorate] = useState("Cairo");
  const [grade, setGrade] = useState(11);
  const [interests, setInterests] = useState<string[]>([]);

  const [toast, setToast] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.studentProfile) {
      const p = user.studentProfile;
      setFirstName(p.firstName || "");
      setLastName(p.lastName || "");
      setPhone(p.phone || "");
      setSchool(p.school || "");
      setGovernorate(p.governorate || "Cairo");
      setGrade(p.grade || 11);
      setInterests(p.interests || []);
      setIsLoading(false);
    }
  }, [user]);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const saveProfile = async () => {
    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          school,
          governorate,
          grade,
          interests,
        }),
        credentials: "include",
      });

      if (res.ok) {
        await refetchUser();
        flash("Profile saved successfully");
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setLocation("/guidr/Login");
  };

  if (isLoading) {
    return (
      <Shell active="Profile">
        <div className="content" style={{ padding: 40, textAlign: "center", color: "#666" }}>
          Loading your student profile...
        </div>
      </Shell>
    );
  }

  const fullName = `${firstName} ${lastName}`.trim() || "Student";
  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "ST";

  return (
    <Shell active="Profile">
      <div className="content">
        <div className="g-label">Your account</div>
        <h1 style={{ fontSize: 34, margin: "6px 0 24px" }}>
          Profile & settings<span style={{ color: "var(--g-red)" }}>.</span>
        </h1>

        <section className="card" style={{ padding: 22, background: "#fff", borderRadius: 8 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 22 }}>
            <div className="avatar" style={{ width: 44, height: 44, fontSize: 14 }}>
              {initials}
            </div>
            <div>
              <b style={{ fontSize: 16 }}>{fullName}</b>
              <div style={{ fontSize: 12, color: "var(--g-muted)" }}>
                Grade {grade} · {school || "Egyptian High School"} ({governorate})
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            <label className="field">
              First name *
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </label>
            <label className="field">
              Last name *
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </label>
            <label className="field">
              Phone number
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+20 100 000 0000" />
            </label>
            <label className="field">
              Email address
              <input value={user?.email || ""} readOnly style={{ opacity: 0.7 }} />
            </label>
            <label className="field">
              School Name
              <input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="e.g. STEM October School" />
            </label>
            <label className="field">
              Grade *
              <select value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
                <option value={9}>Grade 9</option>
                <option value={10}>Grade 10</option>
                <option value={11}>Grade 11</option>
                <option value={12}>Grade 12</option>
              </select>
            </label>
            <label className="field" style={{ gridColumn: "1 / -1" }}>
              Governorate *
              <select value={governorate} onChange={(e) => setGovernorate(e.target.value)}>
                {EGYPTIAN_GOVERNORATES.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="card" style={{ padding: 22, marginTop: 16, background: "#fff", borderRadius: 8 }}>
          <h3 style={{ fontSize: 18, marginBottom: 4 }}>Interests & Pathways</h3>
          <p style={{ fontSize: 12, color: "var(--g-muted)", marginBottom: 14 }}>
            Shape what shows up on your Dashboard recommendations and in Guidr Tutor.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {STUDENT_INTERESTS.map((interest) => {
              const active = interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`g-btn small ${active ? "red" : ""}`}
                  style={{
                    background: active ? "#bd3b3f" : "transparent",
                    color: active ? "#fff" : "#333",
                    border: "1px solid #ccc",
                  }}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </section>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
          <button className="g-btn red" onClick={saveProfile}>
            Save changes
          </button>
          <button
            type="button"
            className="g-btn"
            onClick={handleSignOut}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#888" }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>

        {toast && <div className="ga-toast" style={{ position: "fixed", bottom: 20, right: 20, background: "#333", color: "#fff", padding: "10px 16px", borderRadius: 4 }}>{toast}</div>}
      </div>
    </Shell>
  );
}