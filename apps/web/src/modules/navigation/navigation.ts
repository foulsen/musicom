import { Ear, Dumbbell, FileMusic, GraduationCap, Guitar, Music, RefreshCw } from "@lucide/vue";
import type { NavigationItem } from "./types/navigation-item";

export const navigation: NavigationItem[] = [
  {
    titleKey: "nav.scaleExplorer",
    to: "/",
    icon: Music,
  },
  {
    titleKey: "nav.chordExplorer",
    to: "/chords",
    icon: Guitar,
  },
  {
    titleKey: "nav.modeExplorer",
    to: "/modes",
    icon: RefreshCw,
  },
  {
    titleKey: "nav.earTraining",
    to: "/ear-training",
    icon: Ear,
  },
  {
    titleKey: "nav.drills",
    to: "/drills",
    icon: Dumbbell,
  },
  {
    titleKey: "nav.reading",
    to: "/reading",
    icon: FileMusic,
  },
  {
    titleKey: "nav.learn",
    to: "/learn",
    icon: GraduationCap,
  },
];