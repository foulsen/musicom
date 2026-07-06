import { computed, ref } from "vue";

import {
  CHORD_PATTERNS,
  MAJOR_CHORD_PATTERN,
  Note,
  createChord,
  type ChordPattern,
} from "@music-workspace/music-theory";

/** Estado local da página de estudo de acordes (independente do Scale Explorer). */
export function useChordExplorerViewModel() {
  const selectedRoot = ref<Note>(Note.from("C"));

  const availableQualities: ChordPattern[] = CHORD_PATTERNS;

  const selectedQuality = ref<ChordPattern>(MAJOR_CHORD_PATTERN);

  const chord = computed(() => createChord(selectedRoot.value, selectedQuality.value));

  return {
    selectedRoot,
    availableQualities,
    selectedQuality,
    chord,
  };
}
