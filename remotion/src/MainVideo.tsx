import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { wipe } from "@remotion/transitions/wipe";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import { PersistentBackground } from "./components/PersistentBackground";
import { Intro } from "./scenes/Intro";
import { ModuleScene } from "./scenes/ModuleScene";
import { Outro } from "./scenes/Outro";
import { loadFont as loadJakarta } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

loadJakarta();
loadInter();

const SCENE_DURATION = 90;
const TRANSITION_DURATION = 20;

const transitionConfig = springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DURATION });

const modules = [
  {
    moduleNumber: 1,
    title: "Les Bases",
    subtitle: "Rôle, cadre légal, contrat d'apport d'affaires. Tout comprendre pour démarrer.",
    level: "DÉBUTANT",
    levelColor: "#22C55E",
    icon: "📘",
    accentColor: "#2563EB",
  },
  {
    moduleNumber: 2,
    title: "Construire son Réseau",
    subtitle: "Identifier les décideurs IT, DSI et acheteurs. Techniques de networking efficaces.",
    level: "DÉBUTANT",
    levelColor: "#22C55E",
    icon: "🤝",
    accentColor: "#3B82F6",
  },
  {
    moduleNumber: 3,
    title: "Détecter les Besoins",
    subtitle: "Reconnaître un besoin IT qualifié, poser les bonnes questions, qualifier un lead.",
    level: "INTERMÉDIAIRE",
    levelColor: "#F59E0B",
    icon: "🎯",
    accentColor: "#6366F1",
  },
  {
    moduleNumber: 4,
    title: "Déclarer et Suivre",
    subtitle: "Utiliser la plateforme, remplir un lead, comprendre le pipeline de placement.",
    level: "INTERMÉDIAIRE",
    levelColor: "#F59E0B",
    icon: "📋",
    accentColor: "#8B5CF6",
  },
  {
    moduleNumber: 5,
    title: "Négocier sa Commission",
    subtitle: "Comprendre le TJM, les marges, et optimiser ses revenus récurrents.",
    level: "AVANCÉ",
    levelColor: "#EF4444",
    icon: "💰",
    accentColor: "#7C3AED",
  },
  {
    moduleNumber: 6,
    title: "Devenir Expert",
    subtitle: "Scaler son activité, multi-placements, fidéliser ses clients. Stratégies avancées.",
    level: "EXPERT",
    levelColor: "#A855F7",
    icon: "👑",
    accentColor: "#9333EA",
  },
];

const transitions = [
  wipe({ direction: "from-left" }),
  slide({ direction: "from-right" }),
  fade(),
  wipe({ direction: "from-top" }),
  slide({ direction: "from-left" }),
  fade(),
  wipe({ direction: "from-right" }),
];

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <PersistentBackground />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <Intro />
        </TransitionSeries.Sequence>

        {modules.map((mod, i) => (
          <>
            <TransitionSeries.Transition
              key={`t-${i}`}
              presentation={transitions[i]!}
              timing={transitionConfig}
            />
            <TransitionSeries.Sequence key={`s-${i}`} durationInFrames={SCENE_DURATION}>
              <ModuleScene {...mod} />
            </TransitionSeries.Sequence>
          </>
        ))}

        <TransitionSeries.Transition
          presentation={fade()}
          timing={transitionConfig}
        />
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
