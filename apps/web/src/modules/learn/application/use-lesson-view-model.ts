import { computed, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { buildExplorerLink } from "@/modules/shared/application/explorer-deeplink";
import { useNoteAudio } from "@/modules/shared/application/use-note-audio";

import type { CheckpointQuestion } from "./checkpoint-generators";
import type { ListenCue } from "./curriculum";
import type { CheckpointScore } from "./use-learn-store";
import { useLearnViewModel } from "./use-learn-view-model";

/** Duração estimada (ms) de um cue, para encadear vários e saber quando parar o "tocando". */
function cueDurationMs(cue: ListenCue): number {
  return cue.mode === "chord" ? 700 : cue.pitches.length * 450 + 200;
}

/** Uma lição em andamento: passo atual, navegação, e o "ouça" dos passos de conceito. */
export function useLessonViewModel() {
  const route = useRoute();
  const router = useRouter();

  const { track, markStepDone, recordCheckpoint, visitLesson } = useLearnViewModel();
  const { playChord, playSequence } = useNoteAudio();

  const lessonId = computed(() => String(route.params.lessonId));
  const lesson = computed(() => track.lessons.find((item) => item.id === lessonId.value) ?? null);

  const stepIndex = ref(0);

  watch(
    lessonId,
    (id) => {
      stepIndex.value = 0;
      visitLesson(id);
    },
    { immediate: true },
  );

  const step = computed(() => lesson.value?.steps[stepIndex.value] ?? null);
  const isFirstStep = computed(() => stepIndex.value === 0);
  const isLastStep = computed(() => (lesson.value ? stepIndex.value === lesson.value.steps.length - 1 : true));

  const listenCues = computed<ListenCue[]>(() => {
    if (!lesson.value || step.value?.kind !== "concept" || !step.value.listen) return [];

    return step.value.listen(lesson.value.context);
  });

  const explorerLink = computed(() => {
    if (step.value?.kind !== "explore") return null;

    return buildExplorerLink(step.value.explorerPath, step.value.deeplink);
  });

  /** Grau (1-based) que o passo de exploração destaca — mesmo `degree` usado no deep-link. */
  const highlightDegree = computed<number | undefined>(() => {
    if (step.value?.kind !== "explore" || step.value.deeplink.degree === undefined) return undefined;

    return Number(step.value.deeplink.degree);
  });

  /**
   * Geradas uma única vez por visita ao passo (não recomputa a cada render): o `computed`
   * só reavalia quando `step`/`lesson` mudam, o que não acontece ao responder uma pergunta.
   */
  const checkpointQuestions = computed<CheckpointQuestion[]>(() => {
    if (!lesson.value || step.value?.kind !== "checkpoint") return [];

    return step.value.generate(lesson.value.context);
  });

  const isPlaying = ref(false);
  let playingTimeout: ReturnType<typeof setTimeout> | null = null;

  function playCues(cues: ListenCue[]) {
    if (playingTimeout) clearTimeout(playingTimeout);
    if (cues.length === 0) return;

    isPlaying.value = true;

    let elapsed = 0;
    cues.forEach((cue) => {
      setTimeout(() => {
        if (cue.mode === "chord") playChord(cue.pitches, { strum: true });
        else playSequence(cue.pitches);
      }, elapsed);

      elapsed += cueDurationMs(cue);
    });

    playingTimeout = setTimeout(() => {
      isPlaying.value = false;
    }, elapsed);
  }

  function listen() {
    playCues(listenCues.value);
  }

  onUnmounted(() => {
    if (playingTimeout) clearTimeout(playingTimeout);
  });

  function goNext() {
    if (!lesson.value) return;

    markStepDone(lesson.value.id, stepIndex.value);

    if (isLastStep.value) {
      router.push("/learn");
      return;
    }

    stepIndex.value += 1;
  }

  function goPrevious() {
    if (stepIndex.value > 0) stepIndex.value -= 1;
  }

  function completeCheckpoint(score: CheckpointScore) {
    if (lesson.value) recordCheckpoint(lesson.value.id, score);

    goNext();
  }

  return {
    lesson,
    step,
    stepIndex,
    isFirstStep,
    isLastStep,
    listenCues,
    explorerLink,
    highlightDegree,
    checkpointQuestions,
    isPlaying,

    listen,
    goNext,
    completeCheckpoint,
    goPrevious,
  };
}
