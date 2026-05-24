import { computed, ref } from "vue";

import {
  CHROMATIC_SCALE,
  createScale,
  DORIAN_SCALE_PATTERN,
  MAJOR_SCALE_PATTERN,
  HARMONIC_MINOR_SCALE_PATTERN,
  MELODIC_MINOR_SCALE_PATTERN,
  NATURAL_MINOR_SCALE_PATTERN,
  AEOLIAN_SCALE_PATTERN,
  IONIAN_SCALE_PATTERN,
  LOCRIAN_SCALE_PATTERN,
  LYDIAN_SCALE_PATTERN,
  MIXOLYDIAN_SCALE_PATTERN,
  PHRYGIAN_SCALE_PATTERN,
  Note,
  detectTwoFiveOne,
} from "@music-workspace/music-theory";

export function useScaleExplorer() {
  const selectedRoot = ref(new Note("C"));

  const availablePatterns = [
    MAJOR_SCALE_PATTERN,

    NATURAL_MINOR_SCALE_PATTERN,
    HARMONIC_MINOR_SCALE_PATTERN,
    MELODIC_MINOR_SCALE_PATTERN,

    DORIAN_SCALE_PATTERN,
    AEOLIAN_SCALE_PATTERN,
    IONIAN_SCALE_PATTERN,
    LOCRIAN_SCALE_PATTERN,
    LYDIAN_SCALE_PATTERN,
    MIXOLYDIAN_SCALE_PATTERN,
    PHRYGIAN_SCALE_PATTERN,
  ];

  const selectedPattern = ref(MAJOR_SCALE_PATTERN);

  const scale = computed(() => {
    return createScale(selectedRoot.value, selectedPattern.value);
  });

  const notes = computed(() => {
    return scale.value.notes();
  });

  const progressions = computed(() => {
    return detectTwoFiveOne(scale.value.seventhChords());
  });

  function selectRoot(note: string) {
    selectedRoot.value = new Note(note as any);
  }

  function selectPattern(name: string) {
    const pattern = availablePatterns.find((pattern) => pattern.name === name);

    if (!pattern) {
      return;
    }

    selectedPattern.value = pattern;
  }

  return {
    chromaticScale: CHROMATIC_SCALE,

    availablePatterns,

    selectedRoot,
    selectedPattern,

    scale,
    notes,

    selectRoot,
    selectPattern,
    progressions,
  };
}
