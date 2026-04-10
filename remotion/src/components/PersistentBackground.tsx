import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

export const PersistentBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const gradientAngle = interpolate(frame, [0, durationInFrames], [135, 225]);
  const pulse = Math.sin(frame * 0.03) * 5;

  return (
    <AbsoluteFill>
      <div
        style={{
          width: "100%",
          height: "100%",
          background: `linear-gradient(${gradientAngle}deg, #0F172A 0%, #1E293B ${45 + pulse}%, #0F172A 100%)`,
        }}
      />
      {/* Floating accent orbs */}
      {[0, 1, 2].map((i) => {
        const x = interpolate(frame, [0, durationInFrames], [10 + i * 30, 20 + i * 25]);
        const y = 20 + Math.sin(frame * 0.02 + i * 2) * 15;
        const opacity = 0.08 + Math.sin(frame * 0.015 + i) * 0.04;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: i % 2 === 0
                ? "radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)",
              opacity,
              filter: "blur(60px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
