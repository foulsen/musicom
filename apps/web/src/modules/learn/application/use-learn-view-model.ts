import { computed } from "vue";
import { storeToRefs } from "pinia";

import { bestCheckpoint, isCheckpointMastered } from "./checkpoint-mastery";
import { FUNDAMENTALS_TRACK, type Lesson } from "./curriculum";
import { useLearnStore, type CheckpointScore } from "./use-learn-store";
import { useStudyActivity } from "./use-study-activity";

/** `review`: lição concluída, mas a melhor tentativa do checkpoint ficou abaixo da meta (gate suave). */
export type LessonStatus = "locked" | "available" | "in-progress" | "review" | "completed";

export interface LessonWithStatus {
  lesson: Lesson;
  status: LessonStatus;
  checkpoint: CheckpointScore | null;
}

interface LessonStatusInput {
  isComplete: boolean;
  isLocked: boolean;
  hasStarted: boolean;
  /** Melhor tentativa registrada do checkpoint, se houver. */
  checkpoint?: CheckpointScore | null;
}

/** Deriva o estado exibido na trilha; "Revisar" nunca bloqueia — só sinaliza que vale refazer o checkpoint. */
export function deriveLessonStatus({ isComplete, isLocked, hasStarted, checkpoint }: LessonStatusInput): LessonStatus {
  if (isComplete) return checkpoint && !isCheckpointMastered(checkpoint) ? "review" : "completed";
  if (isLocked) return "locked";

  return hasStarted ? "in-progress" : "available";
}

/** Estado e navegação da trilha de aprendizado (MVP: uma única trilha, `FUNDAMENTALS_TRACK`). */
export function useLearnViewModel() {
  const store = useLearnStore();
  const { progress, lastVisitedLessonId } = storeToRefs(store);
  const { recordActivity } = useStudyActivity();

  const track = FUNDAMENTALS_TRACK;

  function completedStepCount(lessonId: string): number {
    return progress.value[lessonId]?.completedStepIndexes.length ?? 0;
  }

  function isLessonComplete(lesson: Lesson): boolean {
    return completedStepCount(lesson.id) >= lesson.steps.length;
  }

  function lessonStatus(lesson: Lesson): LessonStatus {
    const prerequisite = track.lessons.find((item) => item.id === lesson.prerequisiteId);

    return deriveLessonStatus({
      isComplete: isLessonComplete(lesson),
      isLocked: !!prerequisite && !isLessonComplete(prerequisite),
      hasStarted: completedStepCount(lesson.id) > 0,
      checkpoint: progress.value[lesson.id]?.checkpoint,
    });
  }

  /** Melhor pontuação já registrada no checkpoint da lição. */
  function bestCheckpointOf(lessonId: string): CheckpointScore | null {
    return progress.value[lessonId]?.checkpoint ?? null;
  }

  const lessonsWithStatus = computed<LessonWithStatus[]>(() =>
    track.lessons.map((lesson) => ({
      lesson,
      status: lessonStatus(lesson),
      checkpoint: progress.value[lesson.id]?.checkpoint ?? null,
    })),
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
    recordActivity();

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
    // Conta mesmo quando a tentativa não supera a melhor (e portanto não altera `progress`).
    recordActivity();

    const current = progress.value[lessonId] ?? { completedStepIndexes: [] };

    // `checkpoint` guarda a MELHOR tentativa, não a última (gate suave: refazer nunca piora o status).
    progress.value[lessonId] = { ...current, checkpoint: bestCheckpoint(current.checkpoint, checkpoint) };
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

    completedStepCount,
    bestCheckpointOf,
    markStepDone,
    recordCheckpoint,
    visitLesson,
    resetProgress,
  };
}
