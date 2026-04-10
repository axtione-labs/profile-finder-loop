import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// 8 scenes × 90 frames each = 720, minus 7 transitions × 20 frames = 580 frames
export const RemotionRoot = () => (
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={580}
    fps={30}
    width={1920}
    height={1080}
  />
);
