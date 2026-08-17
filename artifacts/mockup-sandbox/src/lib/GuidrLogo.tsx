type GuidrLogoProps = {
  size?: number;
  className?: string;
};

export function GuidrLogo({ size = 38, className = "logo-mark" }: GuidrLogoProps) {
  return (
    <img
      src="/guidr-logo.png"
      alt="Guidr"
      className={className}
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }}
    />
  );
}
