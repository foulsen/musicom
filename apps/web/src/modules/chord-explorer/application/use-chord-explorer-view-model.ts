import { computed, ref, watch } from "vue";

import {
  CHORD_FAMILIES,
  Fretboard,
  Interval,
  Note,
  STANDARD_GUITAR_TUNING,
  TRIADS_FAMILY,
  createChord,
  type ChordFamily,
  type ChordPattern,
} from "@music-workspace/music-theory";

import type { FretboardNote } from "@/modules/shared/types/fretboard-note";
import type { ChordCardData } from "@/modules/shared/types/chord-shape";
import { resolveChordCard } from "@/modules/shared/application/chord-cards";

/** Braço em afinação padrão para o mapa de notas do acorde. */
const standardFretboard = new Fretboard(STANDARD_GUITAR_TUNING);

/** Estado local da página de estudo de acordes (independente do Scale Explorer). */
export function useChordExplorerViewModel() {
  const selectedRoot = ref<Note>(Note.from("C"));

  const availableFamilies: ChordFamily[] = CHORD_FAMILIES;

  const selectedFamily = ref<ChordFamily>(TRIADS_FAMILY);

  const selectedQuality = ref<ChordPattern>(TRIADS_FAMILY.patterns[0]);

  // Ao trocar de família, seleciona a primeira qualidade dela.
  watch(selectedFamily, (family) => {
    selectedQuality.value = family.patterns[0] ?? selectedQuality.value;
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

  /** Posições do braço categorizadas para o acorde (reusa o FretboardDiagram). */
  const fretboardPositions = computed<FretboardNote[][]>(() => {
    const current = chord.value;

    const spelledByPitchClass = new Map<number, string>();
    current.notes.forEach((note, index) => {
      spelledByPitchClass.set(note.index(), current.spelledNotes[index].toString());
    });

    return standardFretboard.positions().map((row) =>
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
  };
}
