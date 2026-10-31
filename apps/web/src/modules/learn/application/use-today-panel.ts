import { computed } from "vue";
import { storeToRefs } from "pinia";

import { Fretboard, STANDARD_GUITAR_TUNING } from "@music-workspace/music-theory";

import { summarizeByString } from "@/modules/drills/application/note-id-sampling";
import { useDrillsStore } from "@/modules/drills/application/use-drills-store";
import { useDueReviews } from "@/modules/drills/application/use-due-reviews";
import { labelForItem } from "@/modules/ear-training/application/question-generators";
import { useEarTrainingStore } from "@/modules/ear-training/application/use-ear-training-store";

import { currentStreak, toLocalIsoDate } from "./study-streak";
import { weakestEarItems, weakestNoteIdString } from "./today-summary";
import { useLearnStore } from "./use-learn-store";
import { useLearnViewModel } from "./use-learn-view-model";

/** Posições do braço padrão (as mesmas do Note ID) para resumir o acerto por corda. */
const NOTE_ID_STRINGS = new Fretboard(STANDARD_GUITAR_TUNING, 12).positions();
const NOTE_ID_POSITIONS = NOTE_ID_STRINGS.flat();

/** Dados do painel "Hoje" da página de Trilhas: o que estudar agora, somando lições, flashcards e treinos. */
export function useTodayPanel() {
  const { lessonsWithStatus, continueLesson } = useLearnViewModel();
  const { dueCount, newCount } = useDueReviews();
  const earTraining = useEarTrainingStore();
  const { noteIdStats } = storeToRefs(useDrillsStore());
  const { studyDays } = storeToRefs(useLearnStore());

  /** Já começou a trilha (alguma lição iniciada, concluída ou para revisar)? Define o tom do convite. */
  const hasStartedTrack = computed(() =>
    lessonsWithStatus.value.some((item) => item.status !== "locked" && item.status !== "available"),
  );

  const lessonsToReview = computed(() => lessonsWithStatus.value.filter((item) => item.status === "review"));

  const weakEarItems = computed(() =>
    weakestEarItems(earTraining).map((item) => ({ ...item, label: labelForItem(item.kind, item.id) })),
  );

  const weakNoteIdString = computed(() => {
    const weakest = weakestNoteIdString(summarizeByString(NOTE_ID_POSITIONS, noteIdStats.value));
    if (!weakest) return null;

    return {
      ...weakest,
      openNote: NOTE_ID_STRINGS[weakest.string][0].pitch.note.value,
      /** Numeração de violão: 6 = corda mais grave. */
      stringNumber: NOTE_ID_STRINGS.length - weakest.string,
    };
  });

  const today = computed(() => toLocalIsoDate(new Date()));
  const streak = computed(() => currentStreak(studyDays.value, today.value));
  const studiedToday = computed(() => studyDays.value.includes(today.value));

  return {
    nextLesson: continueLesson,
    hasStartedTrack,
    lessonsToReview,
    dueCount,
    newCount,
    weakEarItems,
    weakNoteIdString,
    streak,
    studiedToday,
  };
}
