import React, { useState, useRef } from "react";
import { X, ZoomIn, ZoomOut, Check, Crop } from "lucide-react";

interface ImageCropperModalProps {
  imageSrc: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onClose: () => void;
}

export function ImageCropperModal({ imageSrc, onCropComplete, onClose }: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    const img = imgRef.current;
    if (!img) return;

    const canvas = document.createElement("canvas");
    const targetWidth = 600;
    const targetHeight = 338; // 16:9 ratio matching Opportunity card banner
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    const previewBoxWidth = 360;
    const previewBoxHeight = 202.5;
    const scaleFactor = targetWidth / previewBoxWidth;

    const imgWidth = img.naturalWidth || 600;
    const imgHeight = img.naturalHeight || 338;

    const baseScale = Math.max(previewBoxWidth / imgWidth, previewBoxHeight / imgHeight);
    const currentScale = baseScale * zoom;

    const drawWidth = imgWidth * currentScale * scaleFactor;
    const drawHeight = imgHeight * currentScale * scaleFactor;

    const centerX = (targetWidth - drawWidth) / 2 + offset.x * scaleFactor;
    const centerY = (targetHeight - drawHeight) / 2 + offset.y * scaleFactor;

    ctx.drawImage(img, centerX, centerY, drawWidth, drawHeight);

    const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
    onCropComplete(croppedDataUrl);
  };

  return (
    <div className="ga-modal-backdrop" style={{ zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#181818", border: "1px solid #333", borderRadius: 12, width: "min(500px, 92vw)", padding: 24, color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <b style={{ fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Crop size={18} style={{ color: "#bd3b3f" }} /> Crop Opportunity Image
          </b>
          <button type="button" className="ga-icon" onClick={onClose} style={{ color: "#aaa" }}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 16px" }}>
          Drag the image to position it and use the zoom slider to adjust framing for the opportunity card banner.
        </p>

        {/* Interactive Crop Frame */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            position: "relative",
            width: 360,
            height: 202.5,
            margin: "0 auto 20px",
            overflow: "hidden",
            borderRadius: 8,
            border: "2px dashed #bd3b3f",
            cursor: isDragging ? "grabbing" : "grab",
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
          }}
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="To Crop"
            draggable={false}
            style={{
              maxWidth: "none",
              maxHeight: "none",
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transition: isDragging ? "none" : "transform 0.1s ease-out",
              objectFit: "contain",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Zoom Slider Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, padding: "0 10px" }}>
          <ZoomOut size={16} style={{ color: "#aaa" }} />
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: "#bd3b3f", cursor: "pointer" }}
          />
          <ZoomIn size={16} style={{ color: "#aaa" }} />
          <span style={{ fontSize: 11, color: "#aaa", minWidth: 35, textAlign: "right" }}>{Math.round(zoom * 100)}%</span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" className="ga-btn" onClick={onClose} style={{ color: "#fff", borderColor: "#444" }}>
            Cancel
          </button>
          <button type="button" className="ga-btn red" onClick={handleCrop} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Check size={16} /> Crop & Save Image
          </button>
        </div>
      </div>
    </div>
  );
}
