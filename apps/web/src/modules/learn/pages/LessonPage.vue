<script setup lang="ts">
import { computed, nextTick, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";

import { ArrowUpRight, ChevronLeft, CircleCheckBig, Dumbbell, PartyPopper, RotateCcw } from "@lucide/vue";

import { EmptyState } from "@/modules/shared/components/empty-state";

import { MAX_PRACTICE_LINKS, practiceLabel, practiceLink } from "../application/practice";
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
  lastAttemptPercent,
  needsReview,
  masteryTargetPercent,
  nextLesson,
  listen,
  goNext,
  completeCheckpoint,
  redoCheckpoint,
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

/** Atalhos "Pratique agora" do painel de conclusão, montados a partir do `practice` da lição. */
const practiceItems = computed(() =>
  (lesson.value?.practice ?? []).slice(0, MAX_PRACTICE_LINKS).map((target) => {
    const { key, deckKey } = practiceLabel(target);

    return { to: practiceLink(target), label: deckKey ? t(key, { deck: t(deckKey) }) : t(key) };
  }),
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

        <div v-if="lastCheckpointScore" class="space-y-1 text-sm text-muted-foreground">
          <p>
            {{
              t("learn.completion.checkpointScore", {
                correct: lastCheckpointScore.correct,
                total: lastCheckpointScore.total,
                percent: lastAttemptPercent,
              })
            }}
          </p>
          <p>{{ t("learn.completion.checkpointTarget", { target: masteryTargetPercent }) }}</p>
          <p v-if="!needsReview" class="font-medium text-brand">{{ t("learn.completion.checkpointMastered") }}</p>
        </div>

        <div v-if="needsReview" class="flex max-w-prose flex-col items-center gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
          <p class="text-sm text-foreground">
            {{ t("learn.completion.reviewRecommended") }}
          </p>

          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-1.5 text-sm font-medium text-brand-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            @click="redoCheckpoint"
          >
            <rotate-ccw class="size-4" aria-hidden="true" />
            {{ t("learn.completion.redoCheckpoint") }}
          </button>
        </div>

        <section v-if="practiceItems.length > 0" aria-labelledby="lesson-practice-title" class="flex flex-col items-center gap-3">
          <h3 id="lesson-practice-title" class="text-sm font-medium text-foreground">
            {{ t("learn.practice.title") }}
          </h3>

          <ul class="flex flex-wrap justify-center gap-2">
            <li v-for="item in practiceItems" :key="item.label">
              <router-link
                :to="item.to"
                class="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <dumbbell class="size-4 text-brand" aria-hidden="true" />
                {{ item.label }}
              </router-link>
            </li>
          </ul>
        </section>

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
          <template v-if="step.kind === 'concept'">
            <concept-panel
              :title-key="step.titleKey"
              :body-key="step.bodyKey"
              :has-cues="listenCues.length > 0"
              :is-playing="isPlaying"
              @listen="listen"
            />

            <inline-explorer
              v-if="step.viz?.length"
              :key="stepIndex"
              :context="lesson.context"
              :viz="step.viz"
              :intervals="step.intervals"
              :chord-patterns="step.chordPatterns"
              :pattern-labels="step.patternLabels"
              :field-mode="step.fieldMode"
            />
          </template>

          <template v-else-if="step.kind === 'explore'">
            <inline-explorer
              :key="stepIndex"
              :context="lesson.context"
              :viz="step.viz"
              :highlight-degree="highlightDegree"
              :intervals="step.intervals"
              :field-mode="step.fieldMode"
            />

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
