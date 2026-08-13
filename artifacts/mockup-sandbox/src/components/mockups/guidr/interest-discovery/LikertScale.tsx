import type { AnswerValue } from "./types";
import { Check } from "lucide-react";

interface LikertScaleProps {
  labels: [string, string, string, string, string];
  selectedValue: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
}

export function LikertScale({ labels, selectedValue, onChange }: LikertScaleProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "20px 0" }}>
      {labels.map((label, index) => {
        const val = (index + 1) as AnswerValue;
        const isSelected = selectedValue === val;

        return (
          <button
            key={val}
            type="button"
            className="g-btn"
            onClick={() => onChange(val)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              fontSize: 14,
              borderRadius: 6,
              textAlign: "left",
              borderColor: isSelected ? "var(--g-red)" : "rgba(255, 255, 255, 0.12)",
              background: isSelected ? "rgba(189, 59, 63, 0.2)" : "rgba(255, 255, 255, 0.03)",
              color: isSelected ? "#ffffff" : "#d0ceca",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: isSelected ? "2px solid var(--g-red)" : "1px solid rgba(255, 255, 255, 0.25)",
                  background: isSelected ? "var(--g-red)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#ffffff",
                  flexShrink: 0,
                }}
              >
                {val}
              </span>
              <span>{label}</span>
            </div>
            {isSelected && <Check size={16} style={{ color: "var(--g-red)" }} />}
          </button>
        );
      })}
    </div>
  );
}
