<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { ToggleGroupItem, ToggleGroupRoot } from "reka-ui";
import { Play } from "@lucide/vue";

import { useEarTrainingViewModel } from "../application/use-ear-training-view-model";
import type { QuizKind } from "../application/question-generators";
import { AnswerOptions } from "../components/answer-options";

const {
  kind,
  question,
  selectedOptionId,
  isAnswered,
  isCorrect,
  correct,
  total,
  replay,
  newQuestion,
  selectKind,
  answer,
} = useEarTrainingViewModel();

const { t } = useI18n();

const KINDS: QuizKind[] = ["interval", "chordQuality", "scale"];
</script>

<template>
  <section class="flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
    <header class="space-y-1">
      <h1 class="text-2xl font-medium tracking-wide">
        {{ t("earTraining.title") }}
      </h1>
      <p class="text-sm text-muted-foreground">
        {{ t("earTraining.subtitle") }}
      </p>
    </header>

    <div class="flex flex-wrap items-center justify-between gap-4">
      <toggle-group-root
        :model-value="kind"
        type="single"
        :aria-label="t('earTraining.quizType')"
        class="inline-flex gap-1 rounded-lg border border-border bg-card/40 p-1"
        @update:model-value="(value) => value && selectKind(value as QuizKind)"
      >
        <toggle-group-item
          v-for="option in KINDS"
          :key="option"
          :value="option"
          class="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=on]:bg-brand-soft data-[state=on]:text-brand-soft-foreground"
        >
          {{ t(`earTraining.kinds.${option}`) }}
        </toggle-group-item>
      </toggle-group-root>

      <p class="text-sm text-muted-foreground">
        {{ t("earTraining.score", { correct, total }) }}
      </p>
    </div>

    <section class="space-y-4 rounded-xl border border-border bg-card/40 p-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h2 class="text-sm font-medium text-foreground">
          {{ t(`earTraining.prompts.${question.kind}`) }}
        </h2>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-md border border-border bg-card/40 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          @click="replay"
        >
          <play class="size-4" />
          {{ t("earTraining.play") }}
        </button>
      </div>

      <answer-options
        :options="question.options"
        :correct-id="question.correctId"
        :selected-id="selectedOptionId"
        @select="answer"
      />

      <div v-if="isAnswered" class="flex flex-wrap items-center justify-between gap-4">
        <p class="text-sm font-medium" :class="isCorrect ? 'text-brand' : 'text-destructive'">
          {{ isCorrect ? t("earTraining.correct") : t("earTraining.incorrect") }}
        </p>

        <button
          type="button"
          class="rounded-md bg-brand px-4 py-1.5 text-sm font-medium text-brand-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          @click="newQuestion"
        >
          {{ t("earTraining.next") }}
        </button>
      </div>
    </section>
  </section>
</template>
