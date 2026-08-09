import React, { useState, useRef } from "react";
import { X, Upload, Check, Target, Sparkles, Image as ImageIcon } from "lucide-react";

interface ImageManagerModalProps {
  initialImageUrl?: string;
  initialFocus?: string;
  onSave: (imageUrl: string, imageFocus: string) => void;
  onClose: () => void;
}

const HIGH_RES_PRESETS = [
  { name: "STEM Lab & Research", url: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1400&q=90" },
  { name: "Conference & MUN", url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1400&q=90" },
  { name: "Robotics & Tech", url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1400&q=90" },
  { name: "University Campus", url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=90" },
  { name: "Team & Community", url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=90" },
  { name: "Hackathon & Coding", url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1400&q=90" },
];

const ALIGNMENT_PRESETS = [
  { label: "Center", value: "50% 50%" },
  { label: "Top Focus", value: "50% 15%" },
  { label: "Bottom Focus", value: "50% 85%" },
  { label: "Left Focus", value: "15% 50%" },
  { label: "Right Focus", value: "85% 50%" },
];

export function ImageManagerModal({
  initialImageUrl = "",
  initialFocus = "50% 50%",
  onSave,
  onClose,
}: ImageManagerModalProps) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [imageFocus, setImageFocus] = useState(initialFocus);
  const [tab, setTab] = useState<"upload" | "presets">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setImageFocus(`${x}% ${y}%`);
  };

  return (
    <div className="ga-modal-backdrop" style={{ zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#161616", border: "1px solid #333", borderRadius: 12, width: "min(580px, 94vw)", padding: 24, color: "#fff", maxHeight: "90vh", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <b style={{ fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <ImageIcon size={18} style={{ color: "#bd3b3f" }} /> High-Res Opportunity Banner Manager
            </b>
            <p style={{ fontSize: 11, color: "#aaa", margin: "2px 0 0" }}>
              Upload crisp full-resolution photos & select the exact focal point for card framing.
            </p>
          </div>
          <button type="button" className="ga-icon" onClick={onClose} style={{ color: "#aaa" }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18, borderBottom: "1px solid #333", paddingBottom: 10 }}>
          <button
            type="button"
            onClick={() => setTab("upload")}
            style={{
              background: tab === "upload" ? "#bd3b3f" : "transparent",
              color: "#fff",
              border: 0,
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Upload size={14} /> Device Upload
          </button>
          <button
            type="button"
            onClick={() => setTab("presets")}
            style={{
              background: tab === "presets" ? "#bd3b3f" : "transparent",
              color: "#fff",
              border: 0,
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Sparkles size={14} /> High-Res Presets
          </button>
        </div>

        {/* Tab 1: Upload */}
        {tab === "upload" && (
          <div style={{ marginBottom: 20 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "100%",
                padding: 16,
                border: "2px dashed #444",
                background: "#222",
                color: "#fff",
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Upload size={18} style={{ color: "#bd3b3f" }} /> Select High-Resolution Photo from Computer
            </button>
          </div>
        )}

        {/* Tab 2: Presets */}
        {tab === "presets" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
            {HIGH_RES_PRESETS.map((preset) => (
              <div
                key={preset.name}
                onClick={() => setImageUrl(preset.url)}
                style={{
                  position: "relative",
                  height: 75,
                  borderRadius: 6,
                  overflow: "hidden",
                  cursor: "pointer",
                  border: imageUrl === preset.url ? "2px solid #bd3b3f" : "1px solid #444",
                }}
              >
                <img src={preset.url} alt={preset.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", padding: 6, fontSize: 10, fontWeight: 600 }}>
                  {preset.name}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Live Interactive Card Framing & Focal Point Selector */}
        {imageUrl ? (
          <div style={{ background: "#222", border: "1px solid #333", borderRadius: 8, padding: 16, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, color: "#fff" }}>
                <Target size={14} style={{ color: "#bd3b3f" }} /> Card Banner Live Framing & Focal Point
              </span>
              <span style={{ fontSize: 10, color: "#aaa" }}>Click image to place focus target</span>
            </div>

            {/* Interactive Preview Box */}
            <div
              onClick={handlePreviewClick}
              title="Click anywhere to center focus"
              style={{
                position: "relative",
                width: "100%",
                height: 180,
                borderRadius: 8,
                overflow: "hidden",
                cursor: "crosshair",
                background: "#000",
                border: "1px solid #444",
              }}
            >
              <img
                src={imageUrl}
                alt="Banner framing"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: imageFocus,
                }}
              />
              {/* Focal Point Indicator Dot */}
              <div
                style={{
                  position: "absolute",
                  left: imageFocus.split(" ")[0] || "50%",
                  top: imageFocus.split(" ")[1] || "50%",
                  transform: "translate(-50%, -50%)",
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: "2px solid #fff",
                  boxShadow: "0 0 10px rgba(0,0,0,0.8), inset 0 0 4px rgba(189,59,63,0.8)",
                  background: "rgba(189, 59, 63, 0.6)",
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
              </div>
            </div>

            {/* Alignment Quick Buttons */}
            <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#aaa", marginRight: 4 }}>Quick Focus:</span>
              {ALIGNMENT_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setImageFocus(p.value)}
                  style={{
                    background: imageFocus === p.value ? "#bd3b3f" : "#181818",
                    color: "#fff",
                    border: "1px solid #444",
                    borderRadius: 4,
                    padding: "4px 10px",
                    fontSize: 10,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ padding: 24, textAlign: "center", color: "#888", fontSize: 12, border: "1px dashed #333", borderRadius: 8, marginBottom: 20 }}>
            Upload a photo or select a high-res preset above to preview framing.
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" className="ga-btn" onClick={onClose} style={{ color: "#fff", borderColor: "#444" }}>
            Cancel
          </button>
          <button
            type="button"
            className="ga-btn red"
            disabled={!imageUrl}
            onClick={() => {
              if (imageUrl) onSave(imageUrl, imageFocus);
            }}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Check size={16} /> Apply & Save Image
          </button>
        </div>
      </div>
    </div>
  );
}
