import { computed } from "vue";
import { storeToRefs } from "pinia";

import { bestCheckpoint, isCheckpointMastered } from "./checkpoint-mastery";
import { TRACKS, type Lesson, type Track } from "./curriculum";
import { useLearnStore, type CheckpointScore, type LessonProgress } from "./use-learn-store";
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

/**
 * Lição concluída? O progresso guarda os passos por ÍNDICE, e o currículo evolui (passos novos
 * deslocam índices; lições novas entram na trilha), então contar índices sozinho faria uma lição já
 * feita "regredir". O checkpoint é sempre o último passo e só é registrado ao concluí-lo — logo,
 * ter uma pontuação gravada significa lição concluída, qualquer que seja o nº de passos de hoje.
 */
export function isLessonCompleted(lesson: Lesson, entry: LessonProgress | undefined): boolean {
  if (!entry) return false;

  return entry.checkpoint !== undefined || completedIndexCount(lesson, entry) >= lesson.steps.length;
}

/** Índices distintos e ainda válidos (< nº de passos de hoje) concluídos na lição. */
function completedIndexCount(lesson: Lesson, entry: LessonProgress): number {
  return new Set(entry.completedStepIndexes.filter((index) => index < lesson.steps.length)).size;
}

/** Passos concluídos para exibição/retomada: lição concluída conta todos os passos, mesmo com progresso antigo. */
export function completedStepsOf(lesson: Lesson, entry: LessonProgress | undefined): number {
  if (!entry) return 0;

  return isLessonCompleted(lesson, entry) ? lesson.steps.length : completedIndexCount(lesson, entry);
}

/**
 * Bloqueada só quando o pré-requisito não foi concluído E o usuário ainda não avançou nesta lição
 * nem em nenhuma posterior da trilha — lições inseridas antes de progresso existente (ex.: "Notas"
 * e "Intervalos" para quem já fez a escala maior) não podem trancar o que a pessoa já alcançou.
 */
export function isLessonLocked(
  lessons: Lesson[],
  lesson: Lesson,
  progress: Record<string, LessonProgress | undefined>,
): boolean {
  const prerequisite = lessons.find((item) => item.id === lesson.prerequisiteId);
  if (!prerequisite || isLessonCompleted(prerequisite, progress[prerequisite.id])) return false;

  const index = lessons.indexOf(lesson);

  return !lessons.slice(index).some((item) => completedStepsOf(item, progress[item.id]) > 0);
}

/** Uma trilha na página: lições com status, progresso e a lição de "Continuar". */
export interface TrackView {
  track: Track;
  lessonsWithStatus: LessonWithStatus[];
  progressPercent: number;
  continueLesson: Lesson | null;
}

/** Localiza uma lição em qualquer trilha, devolvendo também a trilha dona e o índice dentro dela. */
export function findLessonLocation(
  tracks: Track[],
  lessonId: string,
): { track: Track; lesson: Lesson; index: number } | null {
  for (const track of tracks) {
    const index = track.lessons.findIndex((lesson) => lesson.id === lessonId);
    if (index >= 0) return { track, lesson: track.lessons[index], index };
  }

  return null;
}

/**
 * Lição para o botão "Continuar": a última visitada (se estiver em `items` e ainda aberta), senão a
 * primeira disponível/em progresso depois da última concluída — assim quem já fez lições antigas não
 * é levado de volta a uma lição nova inserida no começo da trilha.
 */
export function pickContinueLesson(items: LessonWithStatus[], lastVisitedLessonId: string | null): Lesson | null {
  const isOpen = (item: LessonWithStatus) => item.status === "in-progress" || item.status === "available";

  // Visitada mas concluída ou bloqueada (ex.: aberta por URL antes do pré-requisito) não vale como "continuar".
  const last = lastVisitedLessonId ? items.find((item) => item.lesson.id === lastVisitedLessonId) : undefined;
  if (last && isOpen(last)) return last.lesson;

  const lastCompletedIndex = items.reduce(
    (found, item, index) => (item.status === "completed" || item.status === "review" ? index : found),
    -1,
  );

  const next = items.slice(lastCompletedIndex + 1).find(isOpen) ?? items.find(isOpen);

  return next?.lesson ?? null;
}

/** Estado e navegação das trilhas de aprendizado (`TRACKS`, na ordem em que aparecem na página). */
export function useLearnViewModel() {
  const store = useLearnStore();
  const { progress, lastVisitedLessonId } = storeToRefs(store);
  const { recordActivity } = useStudyActivity();

  function findLesson(lessonId: string) {
    return findLessonLocation(TRACKS, lessonId);
  }

  function completedStepCount(lessonId: string): number {
    const lesson = findLesson(lessonId)?.lesson;

    return lesson ? completedStepsOf(lesson, progress.value[lessonId]) : 0;
  }

  function lessonStatus(track: Track, lesson: Lesson): LessonStatus {
    return deriveLessonStatus({
      isComplete: isLessonCompleted(lesson, progress.value[lesson.id]),
      isLocked: isLessonLocked(track.lessons, lesson, progress.value),
      hasStarted: completedStepCount(lesson.id) > 0,
      checkpoint: progress.value[lesson.id]?.checkpoint,
    });
  }

  /** Melhor pontuação já registrada no checkpoint da lição. */
  function bestCheckpointOf(lessonId: string): CheckpointScore | null {
    return progress.value[lessonId]?.checkpoint ?? null;
  }

  const tracks = computed<TrackView[]>(() =>
    TRACKS.map((track) => {
      const items = track.lessons.map((lesson) => ({
        lesson,
        status: lessonStatus(track, lesson),
        checkpoint: progress.value[lesson.id]?.checkpoint ?? null,
      }));

      // % de passos concluídos na trilha inteira (soma de todas as lições).
      const totalSteps = track.lessons.reduce((sum, lesson) => sum + lesson.steps.length, 0);
      const doneSteps = track.lessons.reduce((sum, lesson) => sum + completedStepCount(lesson.id), 0);

      return {
        track,
        lessonsWithStatus: items,
        progressPercent: totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100),
        continueLesson: pickContinueLesson(items, lastVisitedLessonId.value),
      };
    }),
  );

  const lessonsWithStatus = computed<LessonWithStatus[]>(() => tracks.value.flatMap((view) => view.lessonsWithStatus));

  /** "Continuar" global: prefere a trilha da última lição visitada; senão, a primeira trilha com algo aberto. */
  const continueLesson = computed<Lesson | null>(() => {
    const lastId = lastVisitedLessonId.value;
    const preferred = lastId
      ? tracks.value.find((view) => view.track.lessons.some((lesson) => lesson.id === lastId))
      : undefined;

    return preferred?.continueLesson ?? tracks.value.find((view) => view.continueLesson)?.continueLesson ?? null;
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
    tracks,
    lessonsWithStatus,
    continueLesson,

    findLesson,
    completedStepCount,
    bestCheckpointOf,
    markStepDone,
    recordCheckpoint,
    visitLesson,
    resetProgress,
  };
}
