import { ArrowRight, X } from "lucide-react";

interface NudgeModalProps {
  isOpen: boolean;
  onTryAssessment: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export function NudgeModal({ isOpen, onTryAssessment, onSkip, onClose }: NudgeModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "min(460px, 100%)",
          background: "#181818",
          border: "1px solid var(--g-red)",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          color: "#ffffff",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            color: "#8a8884",
            cursor: "pointer",
          }}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ffffff" }}>
            Interest Discovery
          </span>
        </div>

        <div>
          <h3 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 8px" }}>
            Unsure about your choices?
          </h3>
          <p style={{ color: "#a8a5a0", fontSize: 13, lineHeight: 1.5, margin: 0 }}>
            Guidr can help you discover areas you might enjoy based on activities you like. It takes about 5 minutes with no right or wrong answers.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
          <button
            type="button"
            className="g-btn red"
            onClick={onTryAssessment}
            style={{ width: "100%", padding: "12px", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            Try Assessment (5 min) <ArrowRight size={14} />
          </button>
          <button
            type="button"
            className="g-btn"
            onClick={onSkip}
            style={{ width: "100%", padding: "10px", fontSize: 13, color: "#8a8884" }}
          >
            Skip & Complete Setup
          </button>
        </div>
      </div>
    </div>
  );
}
