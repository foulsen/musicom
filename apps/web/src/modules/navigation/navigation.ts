import { Guitar, Music } from "@lucide/vue";
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
];