import { ArrowRight, Compass, Clock } from "lucide-react";
import type { PublicConfig } from "./types";

interface DiscoveryIntroProps {
  config: PublicConfig;
  onStart: () => void;
  onManualSelect: () => void;
}

export function DiscoveryIntro({ config, onStart, onManualSelect }: DiscoveryIntroProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--g-red)" }}>
        <Compass size={22} />
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Guidr Interest Discovery
        </span>
      </div>

      <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", lineHeight: 1.25, margin: 0, fontWeight: 600 }}>
        {config.results.introTitle || "Let's discover what you might enjoy."}
      </h2>

      <p style={{ color: "#a8a5a0", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
        {config.results.introBody ||
          "You don't need to know your interests already. We'll ask you about different activities and situations. There are no right or wrong answers."}
      </p>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: 6,
          width: "fit-content",
          fontSize: 12,
          color: "#c0beba",
        }}
      >
        <Clock size={14} style={{ color: "var(--g-red)" }} />
        <span>24 short questions · 5–7 minutes</span>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <button type="button" className="g-btn" onClick={onManualSelect} style={{ flex: 1 }}>
          Choose manually
        </button>
        <button type="button" className="g-btn red" onClick={onStart} style={{ flex: 2 }}>
          Start Assessment <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
