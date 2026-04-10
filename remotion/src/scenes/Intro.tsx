import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleY = interpolate(spring({ frame, fps, config: { damping: 20, stiffness: 180 } }), [0, 1], [60, 0]);
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  const subtitleScale = spring({ frame: frame - 15, fps, config: { damping: 25, stiffness: 200 } });
  const subtitleOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateRight: "clamp" });

  const lineWidth = interpolate(frame, [25, 55], [0, 300], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const badgeOpacity = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const badgeY = interpolate(spring({ frame: frame - 40, fps, config: { damping: 15 } }), [0, 1], [20, 0]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <div
          style={{
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontSize: 72,
            fontWeight: 800,
            color: "#F8FAFC",
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity,
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          Devenez Apporteur
          <br />
          <span style={{ color: "#2563EB" }}>d'Affaires IT</span>
        </div>

        <div
          style={{
            width: lineWidth,
            height: 3,
            background: "linear-gradient(90deg, #2563EB, #7C3AED)",
            borderRadius: 2,
          }}
        />

        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 28,
            color: "#94A3B8",
            opacity: subtitleOpacity,
            transform: `scale(${subtitleScale})`,
          }}
        >
          La formation complète en 6 modules
        </div>

        <div
          style={{
            opacity: badgeOpacity,
            transform: `translateY(${badgeY}px)`,
            background: "linear-gradient(135deg, #2563EB, #7C3AED)",
            padding: "10px 28px",
            borderRadius: 30,
            fontFamily: "Inter, sans-serif",
            fontSize: 18,
            fontWeight: 600,
            color: "#F8FAFC",
            letterSpacing: 1,
          }}
        >
          DU DÉBUTANT À L'EXPERT
        </div>
      </div>
    </AbsoluteFill>
  );
};
