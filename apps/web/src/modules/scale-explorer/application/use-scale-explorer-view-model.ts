import { computed, ref } from "vue";

import type { FretboardNote } from "../types/fretboard-note";
import type { ChordNote } from "../types/chord-note";

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
  Fretboard,
  Interval,
  Tuning,
  TUNINGS,
  STANDARD_GUITAR_TUNING,
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

  const availableTunings = TUNINGS;

  const selectedTuning = ref<Tuning>(STANDARD_GUITAR_TUNING);

  const fretboard = computed(() => new Fretboard(selectedTuning.value));

  /** Grafia enarmônica por classe de altura, derivada da escala selecionada. */
  const spelledByPitchClass = computed(() => {
    const map = new Map<number, string>();
    scale.value.spelledNotes().forEach((spelled) => {
      map.set(spelled.pitchClass(), spelled.toString());
    });
    return map;
  });

  const fretboardPositions = computed<FretboardNote[][]>(() => {
    return fretboard.value.positions().map((row) =>
      row.map((position) => {
        const note = position.pitch.note;

        return {
          ...position,
          label: spelledByPitchClass.value.get(note.index()) ?? note.toString(),
          isTonic: note.equals(scale.value.root),
          inScale: scale.value.contains(note),
          intervalName: new Interval(scale.value.root.distanceTo(note)).name(),
        };
      }),
    );
  });

  const selectedTriadIndex = ref(0);

  const selectedChord = computed(
    () => triads.value[selectedTriadIndex.value] ?? triads.value[0],
  );

  const chordPositions = computed<ChordNote[][]>(() => {
    const chord = selectedChord.value;

    return fretboard.value.positions().map((row) =>
      row.map((position) => {
        const note = position.pitch.note;

        return {
          ...position,
          label: spelledByPitchClass.value.get(note.index()) ?? note.toString(),
          isRoot: note.equals(chord.root),
          inChord: chord.notes.some((chordNote) => chordNote.equals(note)),
          intervalName: new Interval(chord.root.distanceTo(note)).name(),
        };
      }),
    );
  });

  function selectRoot(note: Note) {
    selectedRoot.value = note;
  }

  function selectPattern(pattern: ScalePattern) {
    selectedPattern.value = pattern;
  }

  function selectTuning(tuning: Tuning) {
    selectedTuning.value = tuning;
  }

  function selectChord(index: number) {
    selectedTriadIndex.value = index;
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

    availableTunings,
    selectedTuning,

    fretboardPositions,

    selectedTriadIndex,
    selectedChord,
    chordPositions,

    selectRoot,
    selectPattern,
    selectTuning,
    selectChord,
  };
}
