import { computed } from "vue";
import { storeToRefs } from "pinia";

import { FUNDAMENTALS_TRACK, type Lesson } from "./curriculum";
import { useLearnStore, type CheckpointScore } from "./use-learn-store";

export type LessonStatus = "locked" | "available" | "in-progress" | "completed";

export interface LessonWithStatus {
  lesson: Lesson;
  status: LessonStatus;
}

/** Estado e navegação da trilha de aprendizado (MVP: uma única trilha, `FUNDAMENTALS_TRACK`). */
export function useLearnViewModel() {
  const store = useLearnStore();
  const { progress, lastVisitedLessonId } = storeToRefs(store);

  const track = FUNDAMENTALS_TRACK;

  function completedStepCount(lessonId: string): number {
    return progress.value[lessonId]?.completedStepIndexes.length ?? 0;
  }

  function isLessonComplete(lesson: Lesson): boolean {
    return completedStepCount(lesson.id) >= lesson.steps.length;
  }

  function lessonStatus(lesson: Lesson): LessonStatus {
    if (isLessonComplete(lesson)) return "completed";

    const prerequisite = track.lessons.find((item) => item.id === lesson.prerequisiteId);
    if (prerequisite && !isLessonComplete(prerequisite)) return "locked";

    return completedStepCount(lesson.id) > 0 ? "in-progress" : "available";
  }

  const lessonsWithStatus = computed<LessonWithStatus[]>(() =>
    track.lessons.map((lesson) => ({ lesson, status: lessonStatus(lesson) })),
  );

  /** % de passos concluídos na trilha inteira (soma de todas as lições). */
  const trackProgressPercent = computed(() => {
    const totalSteps = track.lessons.reduce((sum, lesson) => sum + lesson.steps.length, 0);
    const doneSteps = track.lessons.reduce((sum, lesson) => sum + completedStepCount(lesson.id), 0);

    return totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100);
  });

  /** Lição para o botão "Continuar": a última visitada (se incompleta), senão a primeira disponível/em progresso. */
  const continueLesson = computed<Lesson | null>(() => {
    const lastId = lastVisitedLessonId.value;
    const last = lastId ? track.lessons.find((lesson) => lesson.id === lastId) : undefined;
    if (last && !isLessonComplete(last)) return last;

    const next = lessonsWithStatus.value.find(
      (item) => item.status === "in-progress" || item.status === "available",
    );

    return next?.lesson ?? null;
  });

  function markStepDone(lessonId: string, stepIndex: number) {
    const current = progress.value[lessonId] ?? { completedStepIndexes: [] };

    if (!current.completedStepIndexes.includes(stepIndex)) {
      progress.value[lessonId] = {
        ...current,
        completedStepIndexes: [...current.completedStepIndexes, stepIndex],
      };
    }

    lastVisitedLessonId.value = lessonId;
  }

  function recordCheckpoint(lessonId: string, checkpoint: CheckpointScore) {
    const current = progress.value[lessonId] ?? { completedStepIndexes: [] };

    progress.value[lessonId] = { ...current, checkpoint };
  }

  function visitLesson(lessonId: string) {
    lastVisitedLessonId.value = lessonId;
  }

  function resetProgress() {
    progress.value = {};
    lastVisitedLessonId.value = null;
  }

  return {
    track,
    lessonsWithStatus,
    trackProgressPercent,
    continueLesson,

    markStepDone,
    recordCheckpoint,
    visitLesson,
    resetProgress,
  };
}
