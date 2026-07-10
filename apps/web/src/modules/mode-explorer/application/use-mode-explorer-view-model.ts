import { computed, ref } from "vue";
import { storeToRefs } from "pinia";

import type { FretboardNote } from "@/modules/shared/types/fretboard-note";
import type { ChordCardData } from "@/modules/shared/types/chord-shape";

import {
  Fretboard,
  Interval,
  MAJOR_SCALE_MODE_PATTERNS,
  MODE_BRIGHTNESS_ORDER,
  Note,
  Pitch,
  STANDARD_GUITAR_TUNING,
  createScale,
  relativeModesOf,
  type ScalePattern,
  type SingleNote,
} from "@music-workspace/music-theory";

import { resolveChordCard } from "@/modules/shared/application/chord-cards";
import { useExplorerDeeplink } from "@/modules/shared/application/explorer-deeplink";

import { useModeExplorerStore } from "./use-mode-explorer-store";

function ascendingPitches(root: Note, degreeSemitones: number[]): Pitch[] {
  const rootPitch = Pitch.from(root.value, 4);

  return [...degreeSemitones, 12].map((offset) => rootPitch.transpose(offset));
}

export function useModeExplorerViewModel() {
  const store = useModeExplorerStore();
  const {
    parentRootValue,
    modeIndex,
    fretCount,
    selectedTriadIndex: storedTriadIndex,
  } = storeToRefs(store);

  const selectedParentRoot = computed<Note>({
    get: () => Note.from(parentRootValue.value),
    set: (note) => {
      parentRootValue.value = note.value;
    },
  });

  const modes = computed(() => relativeModesOf(selectedParentRoot.value));

  const selectedModeIndex = computed<number>({
    get: () => Math.min(modeIndex.value, modes.value.length - 1),
    set: (index) => {
      modeIndex.value = index;
    },
  });

  const selectedMode = computed(() => modes.value[selectedModeIndex.value]);

  const scale = computed(() => selectedMode.value.scale);

  const notes = computed(() => scale.value.notes());

  const degrees = computed(() => scale.value.degrees());

  const triads = computed(() => scale.value.triads());

  const sevenths = computed(() => scale.value.seventhChords());

  /** Tríades ou sétimas no Harmonic Field (índice de grau preservado entre as duas). */
  const harmonicFieldMode = ref<"triads" | "sevenths">("triads");

  const brightnessRank = computed(() => MODE_BRIGHTNESS_ORDER.indexOf(selectedMode.value.pattern));

  function selectModeByPatternName(name: string) {
    const index = modes.value.findIndex((mode) => mode.pattern.name === name);
    if (index >= 0) selectedModeIndex.value = index;
  }

  /** Pitches ascendentes do modo (via Pitch.transpose, nunca Note+oitava fixa) para "ouvir o modo". */
  const scalePitches = computed<Pitch[]>(() =>
    ascendingPitches(scale.value.root, degrees.value.map((item) => item.degree.semitones())),
  );

  // ── Comparação A/B: mesmo tom-pai e mesma raiz, outro padrão modal ──────────

  const comparisonPatternName = ref<string>(
    MAJOR_SCALE_MODE_PATTERNS.find((pattern) => pattern.name !== selectedMode.value.pattern.name)?.name ??
      MAJOR_SCALE_MODE_PATTERNS[0].name,
  );

  /** Opções de comparação: os 7 modos, exceto o que já está selecionado acima. */
  const comparisonOptions = computed(() =>
    MAJOR_SCALE_MODE_PATTERNS.filter((pattern) => pattern.name !== selectedMode.value.pattern.name),
  );

  const comparisonPattern = computed<ScalePattern>(() => {
    const chosen = comparisonOptions.value.find((pattern) => pattern.name === comparisonPatternName.value);

    return chosen ?? comparisonOptions.value[0];
  });

  function selectComparisonPattern(name: string) {
    comparisonPatternName.value = name;
  }

  /** Mesma raiz do modo selecionado, outro padrão modal — para ouvir/ver a diferença lado a lado. */
  const comparisonScale = computed(() => createScale(scale.value.root, comparisonPattern.value));

  const comparisonDegrees = computed(() => comparisonScale.value.degrees());

  /** Índices de grau (0-based) cuja nota difere entre o modo atual e o de comparação. */
  const differingDegreeIndexes = computed(() => {
    const current = degrees.value;
    const other = comparisonDegrees.value;
    const result = new Set<number>();

    current.forEach((item, index) => {
      if (!other[index] || !item.note.equals(other[index].note)) {
        result.add(index);
      }
    });

    return result;
  });

  const comparisonPitches = computed<Pitch[]>(() =>
    ascendingPitches(
      comparisonScale.value.root,
      comparisonDegrees.value.map((item) => item.degree.semitones()),
    ),
  );

  // ─────────────────────────────────────────────────────────────────────────

  const fretboard = computed(() => new Fretboard(STANDARD_GUITAR_TUNING, fretCount.value));

  /** Grafia enarmônica por classe de altura, derivada do modo selecionado. */
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

  const selectedChordCard = computed<ChordCardData | null>(() => resolveChordCard(selectedChord.value.name));

  function selectChord(index: number) {
    selectedTriadIndex.value = index;
  }

  // Deep-link de entrada (Scale Explorer, futuras Trilhas de aprendizado) via query string.
  const { returnLessonId } = useExplorerDeeplink((config) => {
    if (config.root) {
      selectedParentRoot.value = Note.from(config.root as SingleNote);
    }

    if (config.pattern) {
      selectModeByPatternName(config.pattern);
    }

    if (config.degree !== undefined) {
      const index = Number(config.degree) - 1;
      if (Number.isInteger(index) && index >= 0) selectChord(index);
    }
  });

  return {
    selectedParentRoot,
    modes,
    selectedModeIndex,
    selectedMode,

    brightnessRank,
    brightnessOrder: MODE_BRIGHTNESS_ORDER.map((pattern) => pattern.name),
    selectModeByPatternName,

    scale,
    notes,
    degrees,
    triads,
    sevenths,
    harmonicFieldMode,

    scalePitches,
    spelledByPitchClass,

    comparisonOptions,
    comparisonPattern,
    selectComparisonPattern,
    comparisonScale,
    comparisonDegrees,
    differingDegreeIndexes,
    comparisonPitches,

    fretboardPositions,
    fretCount,

    selectedTriadIndex,
    selectedChord,
    selectedChordCard,

    selectChord,

    returnLessonId,
  };
}
