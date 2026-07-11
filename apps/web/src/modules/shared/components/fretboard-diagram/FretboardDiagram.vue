<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useMediaQuery } from "@vueuse/core";

import type { Pitch } from "@music-workspace/music-theory";

import type { FretboardNote } from "../../types/fretboard-note";

import {
  Toggle
} from "@/components/ui/toggle";

import { Check, X } from "@lucide/vue";

const props = withDefaults(
  defineProps<{
    positions: FretboardNote[][];
    /** Contexto de exibição: define o rótulo do toggle ("fora da escala" vs "fora do acorde"). */
    context?: "scale" | "chord";
    /**
     * Valor incremental (ex.: índice do modo selecionado). Ao mudar, dispara um pulso breve
     * em todas as tônicas do braço — sinaliza "a tônica mudou" mesmo sem clique do usuário.
     */
    pulseTrigger?: number | string;
  }>(),
  { context: "scale", pulseTrigger: undefined },
);

const emit = defineEmits<{
  notePlay: [pitch: Pitch];
}>();

const { t } = useI18n();

const showOutOfScaleLabel = computed(() =>
  props.context === "chord" ? t("fretboard.showOutOfChord") : t("fretboard.showOutOfScale"),
);

const reducedView = ref(false)

/**
 * Configurável por ref (sem UI por ora): quando true, também desenha as notas
 * fora da escala (esmaecidas). No futuro isso vira um controle na interface.
 */
const showOutOfScale = ref(false);

/** Abaixo de `md`, o braço vira vertical (pestana no topo) para caber sem scroll lateral. */
const isVertical = useMediaQuery("(max-width: 767px)");

// Geometria em unidades do viewBox, descrita em eixos abstratos do braço:
// "along" = ao longo do braço (pestana → última casa), "across" = através das cordas.
// `toScreen` decide, por orientação, qual eixo vira X e qual vira Y na tela.
const STRING_GAP = 36;
const OPEN_COL = 44;
const ACROSS_START = 24;
const ACROSS_END = 50;

const stringCount = computed(() => props.positions.length);
const fretCount = computed(() => (props.positions[0]?.length ?? 1) - 1);
const fretWidth = computed(() => (reducedView.value ? 34 : 54));
const noteRadius = computed(() => (reducedView.value ? 10 : 14));

const alongExtent = computed(() => OPEN_COL + fretCount.value * fretWidth.value);
const acrossLastString = computed(() => ACROSS_START + (stringCount.value - 1) * STRING_GAP);
const acrossExtent = computed(() => acrossLastString.value + ACROSS_END);

function toScreen(along: number, across: number) {
  return isVertical.value ? { x: across, y: along } : { x: along, y: across };
}

const width = computed(() => (isVertical.value ? acrossExtent.value : alongExtent.value));
const height = computed(() => (isVertical.value ? alongExtent.value : acrossExtent.value));

const nut = computed(() => {
  const start = toScreen(OPEN_COL, ACROSS_START);
  const end = toScreen(OPEN_COL, acrossLastString.value);
  return { x1: start.x, y1: start.y, x2: end.x, y2: end.y };
});

const strings = computed(() =>
  Array.from({ length: stringCount.value }, (_, row) => {
    const across = ACROSS_START + row * STRING_GAP;
    const start = toScreen(OPEN_COL, across);
    const end = toScreen(alongExtent.value, across);
    return { key: row, x1: start.x, y1: start.y, x2: end.x, y2: end.y };
  }),
);

const frets = computed(() =>
  Array.from({ length: fretCount.value }, (_, i) => {
    const fret = i + 1;
    const along = OPEN_COL + fret * fretWidth.value;
    const start = toScreen(along, ACROSS_START);
    const end = toScreen(along, acrossLastString.value);
    // const labelAlong = OPEN_COL + (fret - 0.5) * FRET_WIDTH;
    const labelAlong = OPEN_COL + fretWidth.value * (fret - 0.5) + (isVertical.value ? 4 : 0);
    const label = toScreen(labelAlong, acrossLastString.value + 36);
    return { fret, x1: start.x, y1: start.y, x2: end.x, y2: end.y, labelX: label.x, labelY: label.y };
  }),
);

interface Cell {
  key: string;
  cx: number;
  cy: number;
  label: string;
  intervalName: string;
  pitch: Pitch;
  circleClass: string;
  textClass: string;
  isTonic: boolean;
}

const CIRCLE_CLASS = {
  tonic: "fill-brand-soft stroke-brand",
  in: "fill-muted stroke-brand",
  out: "fill-muted stroke-transparent opacity-50",
} as const;

const TEXT_CLASS = {
  tonic: "fill-brand-soft-foreground",
  in: "fill-foreground",
  out: "fill-muted-foreground opacity-50",
} as const;

const cells = computed<Cell[]>(() => {
  const rows = props.positions;
  const count = rows.length;
  const result: Cell[] = [];

  rows.forEach((row, stringIndex) => {
    // Corda mais aguda no topo (horizontal) / à esquerda (vertical): inverte a ordem física do domínio.
    let displayRow = count - 1 - stringIndex;

    if (isVertical.value) {
      // Braço vertical: corda mais grave no topo, corda mais aguda embaixo.
      displayRow = stringIndex;
    }

    const across = ACROSS_START + displayRow * STRING_GAP;

    row.forEach((position) => {
      if (!position.isTonic && !position.inScale && !showOutOfScale.value) {
        return;
      }

      const along = position.fret === 0 ? OPEN_COL / 2 : OPEN_COL + (position.fret - 0.5) * fretWidth.value;
      const { x: cx, y: cy } = toScreen(along, across);

      const category = position.isTonic ? "tonic" : position.inScale ? "in" : "out";

      result.push({
        key: `${stringIndex}-${position.fret}`,
        cx,
        cy,
        label: position.label,
        intervalName: position.intervalName,
        pitch: position.pitch,
        circleClass: CIRCLE_CLASS[category],
        textClass: TEXT_CLASS[category],
        isTonic: position.isTonic,
      });
    });
  });

  return result;
});

const hovered = ref<Cell | null>(null);

/** Nota tocada por último: pulsa brevemente como confirmação visual do clique. */
const playedKey = ref<string | null>(null);
let playedTimeout: ReturnType<typeof setTimeout> | undefined;

function playNote(cell: Cell) {
  emit("notePlay", cell.pitch);

  playedKey.value = cell.key;
  clearTimeout(playedTimeout);
  playedTimeout = setTimeout(() => {
    playedKey.value = null;
  }, 260);
}

/** Pulso breve em todas as tônicas quando `pulseTrigger` muda (ex.: troca de modo). */
const pulsingTonic = ref(false);
let pulseTimeout: ReturnType<typeof setTimeout> | undefined;

watch(
  () => props.pulseTrigger,
  (value, oldValue) => {
    if (value === undefined || oldValue === undefined || value === oldValue) return;

    pulsingTonic.value = true;
    clearTimeout(pulseTimeout);
    pulseTimeout = setTimeout(() => {
      pulsingTonic.value = false;
    }, 400);
  },
);

const tooltip = computed(() => {
  const cell = hovered.value;
  if (!cell) return null;

  const text = `${cell.label} · ${cell.intervalName}`;
  const boxWidth = text.length * 7.4 + 16;
  const boxHeight = 22;

  const x = Math.max(4, Math.min(cell.cx - boxWidth / 2, width.value - boxWidth - 4));
  // Acima da nota; se não couber, mostra abaixo.
  const above = cell.cy - noteRadius.value - 8 - boxHeight;
  const y = above < 2 ? cell.cy + noteRadius.value + 8 : above;

  return { x, y, width: boxWidth, height: boxHeight, text, cx: x + boxWidth / 2, cy: y + boxHeight / 2 };
});
</script>

<template>
  <div class="flex flex-col items-end gap-4">
    <toggle
      v-model="showOutOfScale"
      class="w-fit px-4"
      variant="outline"
      size="sm"
    >
    <check v-if="showOutOfScale" />
    <x v-else />
      {{ showOutOfScaleLabel }}
    </toggle>
    <toggle
      v-model="reducedView"
      class="w-fit px-4"
      variant="outline"
      size="sm"
      v-if="isVertical"
    >
    <check v-if="reducedView" />
    <x v-else />
      {{ t('fretboard.showReducedView') }}
    </toggle>
    <div :class="isVertical ? 'w-full' : 'w-full overflow-x-auto'">
      <svg :viewBox="`0 0 ${width} ${height}`" :style="isVertical ? {} : { width: `${width}px` }"
        :class="isVertical ? 'h-auto w-full' : 'max-w-none min-w-full'" role="img" aria-label="Fretboard">
        <!-- Cordas -->
        <line v-for="string in strings" :key="`string-${string.key}`" :x1="string.x1" :y1="string.y1" :x2="string.x2"
          :y2="string.y2" class="stroke-border" stroke-width="1" />

        <!-- Trastes -->
        <line v-for="fret in frets" :key="`fret-${fret.fret}`" :x1="fret.x1" :y1="fret.y1" :x2="fret.x2"
          :y2="fret.y2" class="stroke-border" stroke-width="1" />

        <!-- Pestana (nut) -->
        <line :x1="nut.x1" :y1="nut.y1" :x2="nut.x2" :y2="nut.y2" class="stroke-muted-foreground" stroke-width="3" />

        <!-- Números das casas -->
        <text v-for="fret in frets" :key="`label-${fret.fret}`" :x="fret.labelX" :y="fret.labelY" text-anchor="middle"
          font-size="13" class="fill-muted-foreground">
          {{ fret.fret }}
        </text>

        <!-- Notas -->
        <g v-for="cell in cells" :key="cell.key" class="group cursor-pointer outline-none" tabindex="0" role="button"
          :aria-label="`${cell.label} · ${cell.intervalName}`" @mouseenter="hovered = cell" @mouseleave="hovered = null"
          @focusin="hovered = cell" @focusout="hovered = null" @click="playNote(cell)" @keydown.enter="playNote(cell)"
          @keydown.space.prevent="playNote(cell)">
          <circle :cx="cell.cx" :cy="cell.cy" :r="noteRadius + 5"
            class="pointer-events-none fill-none stroke-ring opacity-0 transition-opacity group-focus-visible:opacity-100"
            stroke-width="2" />
          <circle :cx="cell.cx" :cy="cell.cy"
            :r="hovered?.key === cell.key || playedKey === cell.key ? noteRadius + 3 : noteRadius"
            :class="[cell.circleClass, playedKey === cell.key ? 'transition-all duration-150' : 'transition-all duration-300']"
            stroke-width="2" />
          <circle v-if="playedKey === cell.key" :cx="cell.cx" :cy="cell.cy" :r="noteRadius + 3" class="fill-none stroke-brand"
            stroke-width="2" opacity="0.6">
            <animate attributeName="r" :from="noteRadius + 3" :to="noteRadius + 12" dur="0.35s" fill="freeze" />
            <animate attributeName="opacity" from="0.6" to="0" dur="0.35s" fill="freeze" />
          </circle>
          <circle v-if="cell.isTonic && pulsingTonic" :cx="cell.cx" :cy="cell.cy" :r="noteRadius + 3"
            class="fill-none stroke-brand" stroke-width="2" opacity="0.7">
            <animate attributeName="r" :from="noteRadius + 3" :to="noteRadius + 14" dur="0.4s" fill="freeze" />
            <animate attributeName="opacity" from="0.7" to="0" dur="0.4s" fill="freeze" />
          </circle>
          <text :x="cell.cx" :y="cell.cy" text-anchor="middle" dominant-baseline="central" font-size="13"
            :class="cell.textClass">
            {{ cell.label }}
          </text>
        </g>

        <!-- Tooltip (hover) -->
        <g v-if="tooltip" style="pointer-events: none">
          <rect :x="tooltip.x" :y="tooltip.y" :width="tooltip.width" :height="tooltip.height" rx="6"
            class="fill-popover stroke-border" stroke-width="1" />
          <text :x="tooltip.cx" :y="tooltip.cy" text-anchor="middle" dominant-baseline="central" font-size="12"
            class="fill-popover-foreground">
            {{ tooltip.text }}
          </text>
        </g>
      </svg>
    </div>
  </div>
</template>
