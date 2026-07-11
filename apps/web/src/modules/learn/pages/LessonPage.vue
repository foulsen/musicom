<script setup lang="ts">
import { nextTick, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";

import { ArrowUpRight, ChevronLeft, CircleCheckBig, PartyPopper } from "@lucide/vue";

import { EmptyState } from "@/modules/shared/components/empty-state";

import { useLessonViewModel } from "../application/use-lesson-view-model";
import { LessonStepper } from "../components/lesson-stepper";
import { ConceptPanel } from "../components/concept-panel";
import { InlineExplorer } from "../components/inline-explorer";
import { LessonCheckpoint } from "../components/lesson-checkpoint";

const {
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
  isFinished,
  lastCheckpointScore,
  nextLesson,
  listen,
  goNext,
  completeCheckpoint,
  goPrevious,
  backToTracks,
  goToNextLesson,
} = useLessonViewModel();

const { t } = useI18n();

const stepRegion = useTemplateRef<HTMLElement>("stepRegion");

// Ao trocar de passo (ou concluir a lição), move o foco para o conteúdo novo — sem isso,
// leitores de tela não percebem a mudança (o foco fica parado em botões que não se movem).
watch([stepIndex, isFinished], () => {
  nextTick(() => stepRegion.value?.focus());
});

// A rota `/learn/:lessonId` tem um `titleKey` estático (usado antes da lição resolver);
// aqui sobrescrevemos com o nome da lição assim que ela é conhecida.
watch(
  lesson,
  (current) => {
    document.title = current ? `${t(current.titleKey)} · MUSICOM` : "MUSICOM";
  },
  { immediate: true },
);

function selectStep(index: number) {
  isFinished.value = false;
  stepIndex.value = index;
}
</script>

<template>
  <section class="flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
    <router-link
      to="/learn"
      class="inline-flex w-fit items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      {{ t("learn.lesson.backToTracks") }}
    </router-link>

    <template v-if="lesson && step">
      <header class="space-y-2">
        <h1 class="text-2xl font-medium tracking-wide">
          {{ t(lesson.titleKey) }}
        </h1>
        <lesson-stepper :steps="lesson.steps" :current-index="stepIndex" @select="selectStep" />
      </header>

      <div v-if="isFinished" ref="stepRegion" tabindex="-1" class="flex flex-col items-center gap-4 rounded-xl border border-brand-soft bg-brand-soft/30 p-8 text-center outline-none">
        <party-popper class="size-8 text-brand" aria-hidden="true" />

        <h2 class="text-xl font-medium text-foreground">
          {{ t("learn.completion.title") }}
        </h2>

        <p v-if="lastCheckpointScore" class="text-sm text-muted-foreground">
          {{ t("learn.completion.checkpointScore", { correct: lastCheckpointScore.correct, total: lastCheckpointScore.total }) }}
        </p>

        <div class="flex flex-col items-center gap-3 pt-2">
          <template v-if="nextLesson">
            <p class="text-sm text-foreground">
              {{ t("learn.completion.nextLessonUnlocked", { lesson: t(nextLesson.titleKey) }) }}
            </p>

            <button
              type="button"
              class="rounded-md bg-brand px-4 py-1.5 text-sm font-medium text-brand-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              @click="goToNextLesson"
            >
              {{ t("learn.completion.goToNextLesson") }}
            </button>
          </template>

          <p v-else class="text-sm text-foreground">
            {{ t("learn.completion.trackComplete") }}
          </p>

          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            @click="backToTracks"
          >
            <circle-check-big class="size-4" />
            {{ t("learn.completion.backToTracks") }}
          </button>
        </div>
      </div>

      <template v-else>
        <div ref="stepRegion" tabindex="-1" class="flex flex-col gap-8 outline-none">
          <concept-panel
            v-if="step.kind === 'concept'"
            :body-key="step.bodyKey"
            :has-cues="listenCues.length > 0"
            :is-playing="isPlaying"
            @listen="listen"
          />

          <template v-else-if="step.kind === 'explore'">
            <inline-explorer :context="lesson.context" :viz="step.viz" :highlight-degree="highlightDegree" />

            <router-link
              v-if="explorerLink"
              :to="explorerLink"
              class="inline-flex w-fit items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-brand transition-colors hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {{ t("learn.openInExplorer") }}
              <arrow-up-right class="size-4" />
            </router-link>
          </template>

          <lesson-checkpoint
            v-else-if="step.kind === 'checkpoint'"
            :questions="checkpointQuestions"
            @complete="completeCheckpoint"
          />
        </div>

        <div class="flex items-center justify-between gap-4">
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            :disabled="isFirstStep"
            @click="goPrevious"
          >
            <chevron-left class="size-4" />
            {{ t("learn.previous") }}
          </button>

          <button
            v-if="step.kind !== 'checkpoint' || checkpointQuestions.length === 0"
            type="button"
            class="rounded-md bg-brand px-4 py-1.5 text-sm font-medium text-brand-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            @click="goNext"
          >
            {{ isLastStep ? t("learn.finish") : t("learn.next") }}
          </button>
        </div>
      </template>
    </template>

    <empty-state v-else :title="t('learn.notFound.title')" :description="t('learn.notFound.description')" />
  </section>
</template>
