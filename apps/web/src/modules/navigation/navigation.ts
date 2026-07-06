import { Guitar, Music } from "@lucide/vue";
import type { NavigationItem } from "./types/navigation-item";

export const navigation: NavigationItem[] = [
  {
    title: "scale explorer",
    to: "/",
    icon: Music,
  },
  {
    title: "chord explorer",
    to: "/chords",
    icon: Guitar,
  },
];