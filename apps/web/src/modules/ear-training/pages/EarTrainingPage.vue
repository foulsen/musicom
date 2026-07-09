<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";

import { ToggleGroupItem, ToggleGroupRoot } from "reka-ui";
import { Play, RotateCcw } from "@lucide/vue";

import { useEarTrainingViewModel } from "../application/use-ear-training-view-model";
import type { Difficulty, QuizKind } from "../application/question-generators";
import { AnswerOptions } from "../components/answer-options";

const {
  kind,
  question,
  selectedOptionId,
  isAnswered,
  isCorrect,
  score,
  streak,
  difficulty,
  intervalPlaybackMode,
  replay,
  newQuestion,
  selectKind,
  selectDifficulty,
  selectIntervalPlaybackMode,
  answer,
  resetScore,
} = useEarTrainingViewModel();

const { t } = useI18n();

const KINDS: QuizKind[] = ["interval", "chordQuality", "scale"];
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

/** Atalhos de teclado: 1-4 escolhem a opção, R repete o áudio, Enter avança. */
function handleKeydown(event: KeyboardEvent) {
  if (event.key >= "1" && event.key <= "4") {
    const option = question.value.options[Number(event.key) - 1];
    if (option && !isAnswered.value) answer(option.id);
    return;
  }

  if (event.key.toLowerCase() === "r") {
    replay();
    return;
  }

  if (event.key === "Enter" && isAnswered.value) {
    newQuestion();
  }
}

onMounted(() => window.addEventListener("keydown", handleKeydown));
onUnmounted(() => window.removeEventListener("keydown", handleKeydown));
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

      <div class="flex items-center gap-3">
        <p class="text-sm text-muted-foreground">
          {{ t("earTraining.score", { correct: score.correct, total: score.total }) }}
          <span v-if="streak > 1">· {{ t("earTraining.streak", { streak }) }}</span>
        </p>

        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          :title="t('earTraining.resetScore')"
          @click="resetScore"
        >
          <rotate-ccw class="size-3.5" />
        </button>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-4">
      <toggle-group-root
        :model-value="difficulty"
        type="single"
        :aria-label="t('earTraining.difficulty')"
        class="inline-flex gap-1 rounded-lg border border-border bg-card/40 p-1"
        @update:model-value="(value) => value && selectDifficulty(value as Difficulty)"
      >
        <toggle-group-item
          v-for="option in DIFFICULTIES"
          :key="option"
          :value="option"
          class="rounded-md px-3 py-1 text-xs font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=on]:bg-brand-soft data-[state=on]:text-brand-soft-foreground"
        >
          {{ t(`earTraining.difficulties.${option}`) }}
        </toggle-group-item>
      </toggle-group-root>

      <toggle-group-root
        v-if="kind === 'interval'"
        :model-value="intervalPlaybackMode"
        type="single"
        :aria-label="t('earTraining.intervalPlaybackMode')"
        class="inline-flex gap-1 rounded-lg border border-border bg-card/40 p-1"
        @update:model-value="(value) => value && selectIntervalPlaybackMode(value as 'harmonic' | 'melodic')"
      >
        <toggle-group-item
          value="melodic"
          class="rounded-md px-3 py-1 text-xs font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=on]:bg-brand-soft data-[state=on]:text-brand-soft-foreground"
        >
          {{ t("earTraining.melodic") }}
        </toggle-group-item>
        <toggle-group-item
          value="harmonic"
          class="rounded-md px-3 py-1 text-xs font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=on]:bg-brand-soft data-[state=on]:text-brand-soft-foreground"
        >
          {{ t("earTraining.harmonic") }}
        </toggle-group-item>
      </toggle-group-root>
    </div>

    <section class="space-y-4 rounded-xl border border-border bg-card/40 p-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="space-y-0.5">
          <h2 class="text-sm font-medium text-foreground">
            {{ t(`earTraining.prompts.${question.kind}`) }}
          </h2>
          <p v-if="!isAnswered" class="text-xs text-muted-foreground">
            {{ t("earTraining.clickPlayHint") }}
          </p>
        </div>

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
