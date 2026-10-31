import { computed, ref } from "vue";
import { storeToRefs } from "pinia";

import {
  CHROMATIC_SCALE,
  Fretboard,
  Note,
  STANDARD_GUITAR_TUNING,
  type FretPosition,
  type SingleNote,
} from "@music-workspace/music-theory";

import { randomChoice } from "@/modules/shared/application/random";
import { useNoteAudio } from "@/modules/shared/application/use-note-audio";

import { notePath } from "./note-path";
import { useDrillsStore } from "./use-drills-store";

/** As 12 notas cromáticas, sempre na mesma ordem — ordem fixa ajuda a memorizar a posição dos botões. */
export const NOTE_OPTIONS: SingleNote[] = [...CHROMATIC_SCALE];

/** Uma casa por vez, na afinação padrão: o jogo inverso do "find all" — aqui a posição é dada, a nota é a resposta. */
export function useNoteIdDrill() {
  const store = useDrillsStore();
  const { noteIdScore, noteIdStreak, noteIdBestStreak } = storeToRefs(store);
  const { play } = useNoteAudio();

  const fretboard = new Fretboard(STANDARD_GUITAR_TUNING, 12);
  const positions = fretboard.positions();
  const allPositions = positions.flat();

  const target = ref<FretPosition>(randomChoice(allPositions));
  const selectedNote = ref<SingleNote | null>(null);

  const isAnswered = computed(() => selectedNote.value !== null);
  const isCorrect = computed(
    () => selectedNote.value !== null && target.value.pitch.note.equals(Note.from(selectedNote.value)),
  );

  /** De onde vem a nota da casa-alvo: corda solta + casas, passo a passo (para o feedback depois de responder). */
  const explanation = computed(() =>
    notePath(positions[target.value.string][0].pitch.note, target.value.fret),
  );

  function newRound() {
    target.value = randomChoice(allPositions);
    selectedNote.value = null;
  }

  function answer(note: SingleNote) {
    if (isAnswered.value) return;

    selectedNote.value = note;
    noteIdScore.value.total += 1;

    if (target.value.pitch.note.equals(Note.from(note))) {
      noteIdScore.value.correct += 1;
      noteIdStreak.value += 1;
      noteIdBestStreak.value = Math.max(noteIdBestStreak.value, noteIdStreak.value);
    } else {
      noteIdStreak.value = 0;
    }

    play(target.value.pitch);
  }

  function resetScore() {
    noteIdScore.value.correct = 0;
    noteIdScore.value.total = 0;
  }

  return {
    positions,
    target,
    selectedNote,
    isAnswered,
    isCorrect,
    explanation,
    score: noteIdScore,
    streak: noteIdStreak,
    bestStreak: noteIdBestStreak,
    newRound,
    answer,
    resetScore,
  };
}
