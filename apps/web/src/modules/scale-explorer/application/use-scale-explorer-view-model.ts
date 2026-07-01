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
  ScalePattern,
  detectTwoFiveOne,
} from "@music-workspace/music-theory";

export function useScaleExplorerViewModel() {
  const selectedRoot = ref<Note>(Note.from("C"));

  const availablePatterns: ScalePattern[] = [
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

  const selectedPattern = ref<ScalePattern>(MAJOR_SCALE_PATTERN);

  const scale = computed(() => createScale(selectedRoot.value, selectedPattern.value));

  const notes = computed(() => scale.value.notes());

  const degrees = computed(() => scale.value.degrees());

  const triads = computed(() => scale.value.triads());

  const progressions = computed(() => detectTwoFiveOne(scale.value.seventhChords()));

  function selectRoot(note: Note) {
    selectedRoot.value = note;
  }

  function selectPattern(pattern: ScalePattern) {
    selectedPattern.value = pattern;
  }

  return {
    chromaticScale: CHROMATIC_SCALE,

    availablePatterns,

    selectedRoot,
    selectedPattern,

    scale,
    notes,
    degrees,
    triads,
    progressions,

    selectRoot,
    selectPattern,
  };
}
