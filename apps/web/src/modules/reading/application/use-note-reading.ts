import { storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";

import type { Letter, SpelledNote } from "@music-workspace/music-theory";

import { useNoteAudio } from "@/modules/shared/application/use-note-audio";
import type { StaffHighlight } from "@/modules/shared/components/staff-notation";

import {
  isNoteReadingAnswerCorrect,
  nextNoteReadingQuestion,
  type NoteReadingQuestion,
} from "./note-reading-generator";
import { NOTE_READING_LEVELS } from "./note-reading-levels";
import type { NoteReadingLevelId } from "./reading-types";
import { useReadingStore } from "./use-reading-store";

export interface NoteReadingResult {
  letter: Letter;
  accidental: number;
  correct: boolean;
  /** Nome certo da nota, para a linha de feedback. */
  answer: SpelledNote;
}

export function useNoteReading() {
  const store = useReadingStore();
  const { noteLevel: level, noteStats: stats, noteScore: score, noteStreak: streak, noteBestStreak: bestStreak } =
    storeToRefs(store);
  const { play } = useNoteAudio();

  const question = ref<NoteReadingQuestion>(nextNoteReadingQuestion(level.value, stats.value));
  const result = ref<NoteReadingResult | null>(null);
  /** Acidente escolhido no seletor (-1 bemol, 0 bequadro, 1 sustenido); volta a ♮ a cada nota. */
  const accidental = ref(0);

  const showAccidentals = computed(() => NOTE_READING_LEVELS[level.value].accidentals !== "none");
  const answered = computed(() => result.value !== null);
  /** Destaque da nota depois de respondida; a chave é o `eventKey` do único evento da pauta. */
  const highlights = computed(() => {
    const marks: Record<string, StaffHighlight> = {};
    if (result.value) marks["0:0"] = result.value.correct ? "correct" : "wrong";

    return marks;
  });
  const accuracyPercent = computed(() =>
    score.value.total === 0 ? null : Math.round((score.value.correct / score.value.total) * 100),
  );

  function next() {
    question.value = nextNoteReadingQuestion(level.value, stats.value, question.value.itemKey);
    result.value = null;
    accidental.value = 0;
  }

  function setLevel(levelId: NoteReadingLevelId) {
    level.value = levelId;
  }

  function setAccidental(value: number) {
    if (showAccidentals.value) accidental.value = value;
  }

  /** Corrige o palpite (letra + acidente), atualiza placar/sequência/estatística do item e toca a nota. */
  function answer(letter: Letter, chosenAccidental: number = accidental.value) {
    if (result.value) return;

    const current = question.value;
    const usedAccidental = showAccidentals.value ? chosenAccidental : 0;
    const correct = isNoteReadingAnswerCorrect(current.answer, letter, usedAccidental);
    const previous = stats.value[current.itemKey] ?? { correct: 0, total: 0 };

    stats.value = {
      ...stats.value,
      [current.itemKey]: { correct: previous.correct + (correct ? 1 : 0), total: previous.total + 1 },
    };
    score.value = { correct: score.value.correct + (correct ? 1 : 0), total: score.value.total + 1 };
    streak.value = correct ? streak.value + 1 : 0;
    bestStreak.value = Math.max(bestStreak.value, streak.value);
    result.value = { letter, accidental: usedAccidental, correct, answer: current.answer };

    play(current.pitch.pitch());
  }

  // Trocar de nível (chip, deep-link ou sync) sorteia uma nota nova do nível ativo.
  watch(level, () => {
    question.value = nextNoteReadingQuestion(level.value, stats.value);
    result.value = null;
    accidental.value = 0;
  });

  return {
    level,
    score,
    streak,
    bestStreak,
    accuracyPercent,
    question,
    result,
    answered,
    accidental,
    showAccidentals,
    highlights,
    answer,
    next,
    setLevel,
    setAccidental,
  };
}
