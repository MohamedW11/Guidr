import { Check, Sparkles, RefreshCw } from "lucide-react";
import type { ScoreResponse } from "./types";

interface DiscoveryResultsProps {
  result: ScoreResponse;
  onAccept: (selectedInterests: string[]) => void;
  onManualSelect: () => void;
  onRetake?: () => void;
}

export function DiscoveryResults({ result, onAccept, onManualSelect, onRetake }: DiscoveryResultsProps) {
  const topInterestLabels = result.topInterests.map((item) => item.label);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--g-red)" }}>
        <Sparkles size={20} />
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Assessment Complete
        </span>
      </div>

      {/* Header */}
      <div>
        <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", lineHeight: 1.2, margin: 0, fontWeight: 600 }}>
          We discovered some areas you may enjoy<span style={{ color: "var(--g-red)" }}>.</span>
        </h2>
        <p style={{ color: "#a8a5a0", fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
          {result.summaryText}
        </p>
      </div>

      {/* Top 3-5 Discovered Interests */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="g-label" style={{ margin: 0 }}>
          Recommended categories for you ({result.topInterests.length})
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {result.topInterests.map((interest) => (
            <div
              key={interest.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                background: "rgba(189, 59, 63, 0.15)",
                border: "1px solid var(--g-red)",
                borderRadius: 20,
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <Check size={16} style={{ color: "var(--g-red)" }} />
              <span>{interest.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div
        style={{
          padding: 14,
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 8,
          fontSize: 12,
          color: "#9c9a96",
          lineHeight: 1.5,
        }}
      >
        {result.disclaimer}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
        <button
          type="button"
          className="g-btn red"
          onClick={() => onAccept(topInterestLabels)}
          style={{ width: "100%", padding: "14px", fontSize: 15, fontWeight: 600 }}
        >
          Use these interests
        </button>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="g-btn" onClick={onManualSelect} style={{ flex: 1, fontSize: 13 }}>
            Choose manually
          </button>
          {onRetake && (
            <button
              type="button"
              className="g-btn"
              onClick={onRetake}
              style={{ flex: 1, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <RefreshCw size={13} /> Retake
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
