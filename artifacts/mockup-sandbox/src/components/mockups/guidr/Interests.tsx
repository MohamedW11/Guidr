import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useLocation } from "./_shared/router";
import { Brand } from "./_shared";
import { STUDENT_INTERESTS } from "../../../lib/governorates";
import "./_group.css";

export function Interests() {
  const [selected, setSelected] = useState<string[]>([]);
  const [, setLocation] = useLocation();

  const toggleInterest = (interest: string) => {
    setSelected((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  };

  return (
    <div className="auth guidr">
      <div
        style={{
          width: "min(550px, calc(100% - 40px))",
          margin: "13vh auto",
          paddingBottom: 32,
        }}
      >
        <Brand dark />
        <div
          style={{
            height: 2,
            background: "#3a3a3a",
            marginTop: 42,
          }}
        >
          <div
            style={{
              height: 2,
              width: "100%",
              background: "var(--g-red)",
            }}
          />
        </div>

        <div className="g-label" style={{ marginTop: 28 }}>
          Step 3 of 3
        </div>
        <h1 style={{ fontSize: 34, margin: "12px 0 8px" }}>
          What are you curious about?
        </h1>
        <p style={{ fontSize: 12, color: "#92908c", margin: 0 }}>
          Choose all the areas you want to explore. You can always change these
          later.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 8,
            margin: "24px 0",
            maxHeight: 300,
            overflowY: "auto",
            paddingRight: 6,
          }}
        >
          {STUDENT_INTERESTS.map((interest) => {
            const isSelected = selected.includes(interest);
            return (
              <button
                key={interest}
                className="g-btn"
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleInterest(interest)}
                style={{
                  borderColor: isSelected ? "var(--g-red)" : undefined,
                  background: isSelected ? "var(--g-red)" : undefined,
                  color: isSelected ? "var(--g-paper)" : undefined,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textAlign: "left",
                  minHeight: 44,
                }}
              >
                {interest}
                {isSelected && <Check size={14} aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        <button
          className="g-btn red"
          type="button"
          disabled={selected.length === 0}
          onClick={() => setLocation("/guidr/Dashboard")}
          style={{
            opacity: selected.length === 0 ? 0.45 : 1,
            cursor: selected.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          Finish setup <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}