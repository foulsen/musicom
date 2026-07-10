import { computed, ref } from "vue";
import { storeToRefs } from "pinia";

import type { FretboardNote } from "@/modules/shared/types/fretboard-note";
import type { ChordCardData } from "@/modules/shared/types/chord-shape";

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
  STANDARD_GUITAR_TUNING,
  type SingleNote,
} from "@music-workspace/music-theory";

import { resolveChordCard } from "@/modules/shared/application/chord-cards";
import { useExplorerDeeplink } from "@/modules/shared/application/explorer-deeplink";

import { useScaleExplorerStore } from "./use-scale-explorer-store";

export function useScaleExplorerViewModel() {
  const store = useScaleExplorerStore();
  const { rootValue, patternName, fretCount, selectedTriadIndex: storedTriadIndex } = storeToRefs(store);

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

  const selectedRoot = computed<Note>({
    get: () => Note.from(rootValue.value),
    set: (note) => {
      rootValue.value = note.value;
    },
  });

  const selectedPattern = computed<ScalePattern>({
    get: () => availablePatterns.find((pattern) => pattern.name === patternName.value) ?? MAJOR_SCALE_PATTERN,
    set: (pattern) => {
      patternName.value = pattern.name;
    },
  });

  const scale = computed(() => createScale(selectedRoot.value, selectedPattern.value));

  const notes = computed(() => scale.value.notes());

  const degrees = computed(() => scale.value.degrees());

  const triads = computed(() => scale.value.triads());

  const sevenths = computed(() => scale.value.seventhChords());

  /** Tríades ou sétimas no Harmonic Field (índice de grau preservado entre as duas). */
  const harmonicFieldMode = ref<"triads" | "sevenths">("triads");

  const fretboard = computed(() => new Fretboard(STANDARD_GUITAR_TUNING, fretCount.value));

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

  const selectedTriadIndex = computed({
    get: () => Math.min(storedTriadIndex.value, triads.value.length - 1),
    set: (index) => {
      storedTriadIndex.value = index;
    },
  });

  const activeHarmonicFieldChords = computed(() =>
    harmonicFieldMode.value === "triads" ? triads.value : sevenths.value,
  );

  const selectedChord = computed(
    () => activeHarmonicFieldChords.value[selectedTriadIndex.value] ?? triads.value[0],
  );

  /** Cartão de digitações do acorde selecionado, se houver um no banco. */
  const selectedChordCard = computed<ChordCardData | null>(() =>
    resolveChordCard(selectedChord.value.name),
  );

  function selectRoot(note: Note) {
    selectedRoot.value = note;
  }

  function selectPattern(pattern: ScalePattern) {
    selectedPattern.value = pattern;
  }

  function selectChord(index: number) {
    selectedTriadIndex.value = index;
  }

  function selectFretCount(count: number) {
    fretCount.value = count;
  }

  // Deep-link de entrada (Chord Explorer, futuras Trilhas de aprendizado) via query string.
  const { returnLessonId } = useExplorerDeeplink((config) => {
    if (config.root) {
      selectRoot(Note.from(config.root as SingleNote));
    }

    if (config.pattern) {
      const pattern = availablePatterns.find((item) => item.name === config.pattern);
      if (pattern) selectPattern(pattern);
    }

    if (config.degree !== undefined) {
      const index = Number(config.degree) - 1;
      if (Number.isInteger(index) && index >= 0) selectChord(index);
    }
  });

  return {
    chromaticScale: CHROMATIC_SCALE,

    availablePatterns,

    selectedRoot,
    selectedPattern,

    scale,
    notes,
    degrees,
    triads,
    sevenths,
    harmonicFieldMode,

    spelledByPitchClass,

    fretboardPositions,
    fretCount,
    selectFretCount,

    selectedTriadIndex,
    selectedChord,
    selectedChordCard,

    selectRoot,
    selectPattern,
    selectChord,

    returnLessonId,
  };
}
