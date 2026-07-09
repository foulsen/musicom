import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";

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

import { useChordExplorerStore } from "./use-chord-explorer-store";

/** Estado local da página de estudo de acordes (independente do Scale Explorer). */
export function useChordExplorerViewModel() {
  const route = useRoute();
  const router = useRouter();

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

  // Ao entrar vindo do Harmonic Field (Scale Explorer), aplica a seleção da query string.
  onMounted(() => {
    const queryRoot = route.query.root;
    const queryFamily = route.query.family;
    const queryQuality = route.query.quality;

    if (typeof queryRoot === "string") {
      rootValue.value = queryRoot as SingleNote;
    }

    if (typeof queryFamily === "string") {
      const family = availableFamilies.find((item) => item.name === queryFamily);
      if (family) familyName.value = family.name;
    }

    if (typeof queryQuality === "string") {
      qualityName.value = queryQuality;
    }

    if (queryRoot || queryFamily || queryQuality) {
      router.replace({ query: {} });
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

  /** Posições do braço categorizadas para o acorde (reusa o FretboardDiagram). */
  const fretboardPositions = computed<FretboardNote[][]>(() => {
    const current = chord.value;

    const spelledByPitchClass = new Map<number, string>();
    current.notes.forEach((note, index) => {
      spelledByPitchClass.set(note.index(), current.spelledNotes[index].toString());
    });

    return fretboard.value.positions().map((row) =>
      row.map((position) => {
        const note = position.pitch.note;

        return {
          ...position,
          label: spelledByPitchClass.get(note.index()) ?? note.toString(),
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
    fretboardPositions,
    fretCount,
    selectFretCount,
  };
}
