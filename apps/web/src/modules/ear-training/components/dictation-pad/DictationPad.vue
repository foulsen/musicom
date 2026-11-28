<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { Check, Delete, X } from "@lucide/vue";

import { useMusicTerms } from "@/modules/shared/application/music-terms";

import { scaleDegreeLabel } from "../../application/question-generators";

const props = defineProps<{
  /** Graus corretos da melodia (ids em semitons), em ordem — define quantos espaços existem. */
  expected: string[];
  /** Graus digitados até agora. */
  entered: string[];
  /** Graus oferecidos no teclado. */
  vocabulary: string[];
  answered: boolean;
}>();

const emit = defineEmits<{
  enter: [degreeId: string];
  backspace: [];
  clear: [];
}>();

const { t } = useI18n();
const { label } = useMusicTerms();

function degreeText(degreeId: string): string {
  return label(scaleDegreeLabel(Number(degreeId)));
}

function isCorrectAt(index: number): boolean {
  return props.entered[index] === props.expected[index];
}

/** Estado visual do espaço: cor + o ícone ✓/✗ (a cor sozinha não carrega o sentido). */
function slotClass(index: number): string {
  if (props.answered) {
    return isCorrectAt(index)
      ? "border-brand bg-brand-soft text-brand-soft-foreground"
      : "border-destructive bg-destructive/10 text-destructive";
  }

  if (index < props.entered.length) return "border-border bg-card text-foreground";

  return index === props.entered.length
    ? "border-ring bg-card/40 text-muted-foreground ring-2 ring-ring/40"
    : "border-dashed border-border bg-card/20 text-muted-foreground";
}

/** Texto para leitores de tela: o visual do espaço é só o grau digitado e o ✓/✗. */
function slotDescription(index: number): string {
  const position = index + 1;
  const entered = props.entered[index];

  if (entered === undefined) return t("earTraining.dictation.slotEmpty", { position });
  if (!props.answered) return `${position}: ${degreeText(entered)}`;
  if (isCorrectAt(index)) return t("earTraining.dictation.slotCorrect", { position, entered: degreeText(entered) });

  return t("earTraining.dictation.slotWrong", {
    position,
    entered: degreeText(entered),
    expected: degreeText(props.expected[index]),
  });
}

/**
 * Botões ficam focáveis depois de respondido (`aria-disabled` + clique ignorado, em vez de `disabled`),
 * como no `AnswerOptions`: o foco do teclado não evapora (WCAG 4.1.3).
 */
function handleEnter(degreeId: string) {
  if (!props.answered) emit("enter", degreeId);
}

function handleBackspace() {
  if (!props.answered) emit("backspace");
}

function handleClear() {
  if (!props.answered) emit("clear");
}

const keyClass =
  "rounded-lg border px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring";
</script>

<template>
  <div class="space-y-4">
    <ol :aria-label="t('earTraining.dictation.slotsLabel')" class="flex flex-wrap justify-center gap-3">
      <li v-for="(_, index) in expected" :key="index" class="flex w-14 flex-col items-center gap-1">
        <span class="sr-only">{{ slotDescription(index) }}</span>

        <span
          aria-hidden="true"
          class="flex h-14 w-full items-center justify-center rounded-lg border text-lg font-semibold transition-colors"
          :class="slotClass(index)"
        >
          {{ entered[index] !== undefined ? degreeText(entered[index]) : "" }}
        </span>

        <!-- Depois de responder: ✓ nos acertos; nos erros, ✗ e o grau correto embaixo. -->
        <span
          v-if="answered"
          aria-hidden="true"
          class="inline-flex h-5 items-center gap-1 text-xs font-medium"
          :class="isCorrectAt(index) ? 'text-brand' : 'text-destructive'"
        >
          <check v-if="isCorrectAt(index)" class="size-3.5" />
          <template v-else>
            <x class="size-3.5" />
            {{ degreeText(expected[index]) }}
          </template>
        </span>
      </li>
    </ol>

    <div role="group" :aria-label="t('earTraining.dictation.keypadLabel')" class="flex flex-wrap justify-center gap-2">
      <button
        v-for="degreeId in vocabulary"
        :key="degreeId"
        type="button"
        :aria-disabled="answered"
        :aria-label="t('earTraining.dictation.degree', { degree: degreeText(degreeId) })"
        :class="[
          keyClass,
          'min-w-12',
          answered
            ? 'cursor-default border-border bg-card/20 text-muted-foreground opacity-60'
            : 'cursor-pointer border-border bg-card/40 text-foreground hover:bg-accent/40',
        ]"
        @click="handleEnter(degreeId)"
      >
        {{ degreeText(degreeId) }}
      </button>

      <button
        type="button"
        :aria-disabled="answered || entered.length === 0"
        :aria-label="t('earTraining.dictation.backspaceLabel')"
        :title="t('earTraining.dictation.backspaceLabel')"
        :class="[
          keyClass,
          'inline-flex items-center gap-1',
          answered || entered.length === 0
            ? 'cursor-default border-border bg-card/20 text-muted-foreground opacity-60'
            : 'cursor-pointer border-border bg-card/40 text-foreground hover:bg-accent/40',
        ]"
        @click="handleBackspace"
      >
        <delete class="size-4" aria-hidden="true" />
        {{ t("earTraining.dictation.backspace") }}
      </button>

      <button
        type="button"
        :aria-disabled="answered || entered.length === 0"
        :aria-label="t('earTraining.dictation.clearLabel')"
        :title="t('earTraining.dictation.clearLabel')"
        :class="[
          keyClass,
          answered || entered.length === 0
            ? 'cursor-default border-border bg-card/20 text-muted-foreground opacity-60'
            : 'cursor-pointer border-border bg-card/40 text-foreground hover:bg-accent/40',
        ]"
        @click="handleClear"
      >
        {{ t("earTraining.dictation.clear") }}
      </button>
    </div>
  </div>
</template>
