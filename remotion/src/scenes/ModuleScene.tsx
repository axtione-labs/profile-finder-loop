import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

interface ModuleSceneProps {
  moduleNumber: number;
  title: string;
  subtitle: string;
  level: string;
  levelColor: string;
  icon: string;
  accentColor: string;
}

export const ModuleScene: React.FC<ModuleSceneProps> = ({
  moduleNumber,
  title,
  subtitle,
  level,
  levelColor,
  icon,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numberScale = spring({ frame, fps, config: { damping: 12, stiffness: 200 } });
  const numberOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  const titleX = interpolate(spring({ frame: frame - 8, fps, config: { damping: 20, stiffness: 180 } }), [0, 1], [-80, 0]);
  const titleOpacity = interpolate(frame, [8, 22], [0, 1], { extrapolateRight: "clamp" });

  const subtitleOpacity = interpolate(frame, [18, 32], [0, 1], { extrapolateRight: "clamp" });
  const subtitleY = interpolate(spring({ frame: frame - 18, fps, config: { damping: 25 } }), [0, 1], [25, 0]);

  const badgeOpacity = interpolate(frame, [28, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const iconFloat = Math.sin(frame * 0.06) * 8;
  const iconOpacity = interpolate(frame, [5, 18], [0, 0.15], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Large background icon */}
      <div
        style={{
          position: "absolute",
          right: 120,
          top: "50%",
          transform: `translateY(calc(-50% + ${iconFloat}px))`,
          fontSize: 280,
          opacity: iconOpacity,
          filter: "blur(1px)",
        }}
      >
        {icon}
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 48, maxWidth: 1200 }}>
        {/* Module number */}
        <div
          style={{
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontSize: 160,
            fontWeight: 900,
            color: accentColor,
            opacity: numberOpacity,
            transform: `scale(${numberScale})`,
            lineHeight: 1,
            textShadow: `0 0 60px ${accentColor}40`,
          }}
        >
          {moduleNumber}
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 20 }}>
          <div
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontSize: 56,
              fontWeight: 700,
              color: "#F8FAFC",
              transform: `translateX(${titleX}px)`,
              opacity: titleOpacity,
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 26,
              color: "#94A3B8",
              opacity: subtitleOpacity,
              transform: `translateY(${subtitleY}px)`,
              maxWidth: 600,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </div>

          <div
            style={{
              opacity: badgeOpacity,
              display: "inline-flex",
              alignSelf: "flex-start",
              padding: "8px 20px",
              borderRadius: 20,
              border: `2px solid ${levelColor}`,
              fontFamily: "Inter, sans-serif",
              fontSize: 16,
              fontWeight: 600,
              color: levelColor,
              letterSpacing: 0.5,
            }}
          >
            {level}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
