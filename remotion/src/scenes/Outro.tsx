import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const modules = ["Bases", "Réseau", "Besoins", "Plateforme", "Commission", "Expert"];

  const barWidth = interpolate(frame, [0, 50], [0, 100], { extrapolateRight: "clamp" });

  const titleOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: "clamp" });
  const titleScale = spring({ frame: frame - 10, fps, config: { damping: 20, stiffness: 180 } });

  const subtitleOpacity = interpolate(frame, [35, 50], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 48, width: 1200 }}>
        <div
          style={{
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontSize: 58,
            fontWeight: 800,
            color: "#F8FAFC",
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
            textAlign: "center",
          }}
        >
          Du débutant à l'<span style={{ color: "#7C3AED" }}>expert</span>
        </div>

        {/* Progress bar */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {modules.map((mod, i) => {
              const dotProgress = interpolate(frame, [i * 7, i * 7 + 15], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, #2563EB, #7C3AED)`,
                      transform: `scale(${dotProgress})`,
                      boxShadow: "0 0 20px rgba(37,99,235,0.4)",
                    }}
                  />
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 14,
                      color: "#94A3B8",
                      opacity: dotProgress,
                    }}
                  >
                    {mod}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ width: "100%", height: 4, background: "#1E293B", borderRadius: 2, overflow: "hidden" }}>
            <div
              style={{
                width: `${barWidth}%`,
                height: "100%",
                background: "linear-gradient(90deg, #2563EB, #7C3AED)",
                borderRadius: 2,
              }}
            />
          </div>
        </div>

        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 24,
            color: "#64748B",
            opacity: subtitleOpacity,
            textAlign: "center",
          }}
        >
          Votre parcours vers le succès commence maintenant
        </div>
      </div>
    </AbsoluteFill>
  );
};
