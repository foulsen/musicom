<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

interface Props {
  /** Tamanho de cada passo em semitons (ex.: Maior = [2, 2, 1, 2, 2, 2, 1]). */
  steps: number[];
  /**
   * Rótulos dos graus nas fronteiras dos passos. Aceita `steps.length + 1` itens (fecha na oitava)
   * ou `steps.length` itens (o último marcador repete o primeiro, a tônica). Outro tamanho é ignorado.
   */
  degreeLabels?: string[];
  /** Mostra a legenda "T = tom · S = semitom…" abaixo das barras (útil para quem ainda não conhece a notação). */
  legend?: boolean;
  /** Rótulo acessível da lista; padrão: "Passos entre os graus". */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), { degreeLabels: undefined, legend: false, ariaLabel: undefined });

const { t } = useI18n();

interface Step {
  semitones: number;
  /** Abreviação visível ("T", "S", "T½"). */
  short: string;
  /** Nome falado ("tom", "semitom", "tom e meio"). */
  spoken: string;
  tone: "whole" | "half" | "wholeHalf" | "other";
}

function describeStep(semitones: number): Pick<Step, "short" | "spoken" | "tone"> {
  switch (semitones) {
    case 1:
      return { short: t("intervals.half"), spoken: t("stepPattern.halfName"), tone: "half" };
    case 2:
      return { short: t("intervals.whole"), spoken: t("stepPattern.wholeName"), tone: "whole" };
    case 3:
      return { short: t("intervals.wholeHalf"), spoken: t("stepPattern.wholeHalfName"), tone: "wholeHalf" };
    default:
      return {
        short: t("stepPattern.other", { n: semitones }),
        spoken: t("terms.semitones", { n: semitones }, semitones),
        tone: "other",
      };
  }
}

const TONE_CLASSES: Record<Step["tone"], string> = {
  whole: "bg-muted text-foreground",
  half: "bg-brand-soft text-brand-soft-foreground",
  wholeHalf: "bg-brand text-brand-foreground",
  other: "bg-muted text-foreground",
};

/** Rótulos já normalizados para `steps.length + 1` marcadores (ou `null` quando não há/invalidos). */
const markers = computed<string[] | null>(() => {
  const labels = props.degreeLabels;

  if (!labels) return null;
  if (labels.length === props.steps.length + 1) return labels;
  if (labels.length === props.steps.length && labels.length > 0) return [...labels, labels[0]];

  return null;
});

const total = computed(() => props.steps.reduce((sum, step) => sum + step, 0));

const items = computed(() =>
  props.steps.map((semitones, index): Step & { ariaLabel: string } => {
    const description = describeStep(semitones);
    const from = markers.value?.[index];
    const to = markers.value?.[index + 1];

    return {
      semitones,
      ...description,
      ariaLabel:
        from && to ? t("stepPattern.stepAriaLabel", { name: description.spoken, from, to }) : description.spoken,
    };
  }),
);

/** Posição (em %) de cada marcador de grau na barra, proporcional aos semitons acumulados. */
const markerPositions = computed(() => {
  if (!markers.value || total.value === 0) return [];

  let accumulated = 0;

  return markers.value.map((label, index) => {
    if (index > 0) accumulated += props.steps[index - 1];

    return { label, left: (accumulated / total.value) * 100 };
  });
});
</script>

<template>
  <div class="min-w-0 space-y-1.5">
    <!-- Os graus ficam fora da árvore de acessibilidade: cada passo já os anuncia no próprio rótulo. -->
    <div v-if="markerPositions.length" class="relative mx-4 h-5" aria-hidden="true">
      <span
        v-for="(marker, index) in markerPositions"
        :key="index"
        class="absolute top-0 -translate-x-1/2 text-xs font-medium leading-5 text-muted-foreground"
        :style="{ left: `${marker.left}%` }"
      >
        {{ marker.label }}
      </span>
    </div>

    <ol :aria-label="ariaLabel ?? t('stepPattern.ariaLabel')" class="mx-4 flex overflow-hidden rounded-md">
      <li
        v-for="(step, index) in items"
        :key="index"
        class="flex h-8 min-w-0 items-center justify-center border-x border-background/70 text-xs font-semibold"
        :class="TONE_CLASSES[step.tone]"
        :style="{ flex: `${step.semitones} 1 0%` }"
      >
        <span aria-hidden="true">{{ step.short }}</span>
        <span class="sr-only">{{ step.ariaLabel }}</span>
      </li>
    </ol>

    <p v-if="legend" class="mx-4 text-xs text-muted-foreground">
      {{ t("stepPattern.legend") }}
    </p>
  </div>
</template>
