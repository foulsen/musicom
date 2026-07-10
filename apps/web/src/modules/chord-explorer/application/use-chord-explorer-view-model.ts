import { computed } from "vue";
import { storeToRefs } from "pinia";

import {
  CHORD_FAMILIES,
  Fretboard,
  Interval,
  Note,
  STANDARD_GUITAR_TUNING,
  createChord,
  type SingleNote,
} from "@music-workspace/music-theory";

import type { FretboardNote } from "@/modules/shared/types/fretboard-note";
import type { ChordCardData } from "@/modules/shared/types/chord-shape";
import { resolveChordCard } from "@/modules/shared/application/chord-cards";
import { useExplorerDeeplink } from "@/modules/shared/application/explorer-deeplink";

import { useChordExplorerStore } from "./use-chord-explorer-store";

/** Estado local da página de estudo de acordes (independente do Scale Explorer). */
export function useChordExplorerViewModel() {
  const store = useChordExplorerStore();
  const { rootValue, familyName, qualityName, fretCount } = storeToRefs(store);

  const availableFamilies = CHORD_FAMILIES;

  const selectedRoot = computed<Note>({
    get: () => Note.from(rootValue.value),
    set: (note) => {
      rootValue.value = note.value;
    },
  });

  const selectedFamily = computed({
    get: () => availableFamilies.find((family) => family.name === familyName.value) ?? availableFamilies[0],
    set: (family) => {
      familyName.value = family.name;
      qualityName.value = family.patterns[0]?.name ?? qualityName.value;
    },
  });

  const selectedQuality = computed({
    get: () =>
      selectedFamily.value.patterns.find((pattern) => pattern.name === qualityName.value) ??
      selectedFamily.value.patterns[0],
    set: (pattern) => {
      qualityName.value = pattern.name;
    },
  });

  // Ao entrar vindo do Harmonic Field (Scale Explorer) ou de uma lição, aplica a query string.
  const { returnLessonId } = useExplorerDeeplink((config) => {
    if (config.root) {
      rootValue.value = config.root as SingleNote;
    }

    if (config.family) {
      const family = availableFamilies.find((item) => item.name === config.family);
      if (family) familyName.value = family.name;
    }

    if (config.quality) {
      qualityName.value = config.quality;
    }
  });

  const chord = computed(() => createChord(selectedRoot.value, selectedQuality.value));

  /** Opções do seletor "Chord": nome (raiz+qualidade) + fórmula, para a família atual. */
  const chordOptions = computed(() =>
    selectedFamily.value.patterns.map((pattern) => ({
      pattern,
      name: createChord(selectedRoot.value, pattern).name,
      formula: pattern.degrees.map((degree) => degree.toString()).join(" - "),
    })),
  );

  /** Notas do acorde (grafia + nome do intervalo), no formato consumido pelo ScaleNotes. */
  const chordNotes = computed(() =>
    selectedQuality.value.degrees.map((degree, index) => ({
      note: chord.value.notes[index],
      degree,
      spelled: chord.value.spelledNotes[index],
    })),
  );

  /** Cartão de digitações do acorde, se houver no banco. */
  const selectedChordCard = computed<ChordCardData | null>(() =>
    resolveChordCard(chord.value.name),
  );

  const fretboard = computed(() => new Fretboard(STANDARD_GUITAR_TUNING, fretCount.value));

  /** Grafia enarmônica por classe de altura, derivada do acorde selecionado. */
  const spelledByPitchClass = computed(() => {
    const current = chord.value;
    const map = new Map<number, string>();

    current.notes.forEach((note, index) => {
      map.set(note.index(), current.spelledNotes[index].toString());
    });

    return map;
  });

  /** Posições do braço categorizadas para o acorde (reusa o FretboardDiagram). */
  const fretboardPositions = computed<FretboardNote[][]>(() => {
    const current = chord.value;

    return fretboard.value.positions().map((row) =>
      row.map((position) => {
        const note = position.pitch.note;

        return {
          ...position,
          label: spelledByPitchClass.value.get(note.index()) ?? note.toString(),
          isTonic: note.equals(current.root),
          inScale: current.notes.some((chordNote) => chordNote.equals(note)),
          intervalName: new Interval(current.root.distanceTo(note)).name(),
        };
      }),
    );
  });

  function selectFretCount(count: number) {
    fretCount.value = count;
  }

  return {
    selectedRoot,
    availableFamilies,
    selectedFamily,
    selectedQuality,
    chord,
    chordOptions,
    chordNotes,
    selectedChordCard,
    spelledByPitchClass,
    fretboardPositions,
    fretCount,
    selectFretCount,
    returnLessonId,
  };
}
