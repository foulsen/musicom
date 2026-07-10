<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { FretPosition } from "@music-workspace/music-theory";

const props = defineProps<{
  positions: FretPosition[][];
  target: FretPosition;
}>();

const { t } = useI18n();

const STRING_GAP = 32;
const FRET_WIDTH = 48;
const LABEL_COL = 20;
const OPEN_COL = LABEL_COL + 64;
const MARGIN = 20;
const HEADER_ROW = 16;
const NOTE_RADIUS = 14;

/** Casas com inlay tradicional: um ponto (única) ou dois (dupla, na oitava). */
const SINGLE_INLAY_FRETS = new Set([3, 5, 7, 9]);
const DOUBLE_INLAY_FRETS = new Set([12]);

const stringCount = computed(() => props.positions.length);
const fretCount = computed(() => (props.positions[0]?.length ?? 1) - 1);

const width = computed(() => OPEN_COL + fretCount.value * FRET_WIDTH + MARGIN);
const height = computed(() => MARGIN * 2 + (stringCount.value - 1) * STRING_GAP);

function displayRowFor(stringIndex: number): number {
  return stringCount.value - 1 - stringIndex;
}

function cyFor(stringIndex: number): number {
  return MARGIN + HEADER_ROW + displayRowFor(stringIndex) * STRING_GAP;
}

function cxFor(fret: number): number {
  return fret === 0 ? OPEN_COL / 2 : OPEN_COL + (fret - 0.5) * FRET_WIDTH;
}

/** Cordas graves são visualmente mais grossas que as agudas, como no violão real. */
function strokeWidthFor(stringIndex: number): number {
  const count = stringCount.value;
  if (count <= 1) return 1.5;

  return 1 + ((count - 1 - stringIndex) / (count - 1)) * 1.5;
}

const strings = computed(() =>
  Array.from({ length: stringCount.value }, (_, row) => {
    const y = cyFor(row);
    const label = props.positions[row]?.[0]?.pitch.note.toString() ?? "";

    return {
      key: row,
      x1: OPEN_COL,
      y1: y,
      x2: width.value - MARGIN,
      y2: y,
      strokeWidth: strokeWidthFor(row),
      labelX: LABEL_COL,
      labelY: y,
      label,
    };
  }),
);

const frets = computed(() =>
  Array.from({ length: fretCount.value }, (_, i) => {
    const fret = i + 1;
    const x = OPEN_COL + fret * FRET_WIDTH;
    return {
      fret,
      x1: x,
      y1: MARGIN + HEADER_ROW,
      x2: x,
      y2: height.value - MARGIN + HEADER_ROW,
      labelX: OPEN_COL + FRET_WIDTH * (fret - 0.5),
      labelY: height.value - MARGIN + HEADER_ROW + 30,
    };
  }),
);

const middleY = computed(() => MARGIN + HEADER_ROW + ((stringCount.value - 1) * STRING_GAP) / 2);

interface Inlay {
  key: string;
  cx: number;
  cy: number[];
}

const inlays = computed<Inlay[]>(() =>
  Array.from({ length: fretCount.value }, (_, i) => i + 1)
    .filter((fret) => SINGLE_INLAY_FRETS.has(fret) || DOUBLE_INLAY_FRETS.has(fret))
    .map((fret) => {
      const cx = OPEN_COL + FRET_WIDTH * (fret - 0.5);

      if (DOUBLE_INLAY_FRETS.has(fret)) {
        return { key: `inlay-${fret}`, cx, cy: [middleY.value - STRING_GAP / 2, middleY.value + STRING_GAP / 2] };
      }

      return { key: `inlay-${fret}`, cx, cy: [middleY.value] };
    }),
);

const targetPoint = computed(() => ({
  cx: cxFor(props.target.fret),
  cy: cyFor(props.target.string),
}));

const targetAriaLabel = computed(() => {
  const stringLabel = props.positions[props.target.string]?.[0]?.pitch.note.toString() ?? "";

  return props.target.fret === 0
    ? t("drills.noteId.targetAriaLabelOpen", { string: stringLabel })
    : t("drills.noteId.targetAriaLabel", { string: stringLabel, fret: props.target.fret });
});
</script>

<template>
  <div class="relative w-full overflow-x-auto">
    <svg
      :viewBox="`0 0 ${width} ${height + HEADER_ROW + 24}`"
      :style="{ width: `${width}px` }"
      class="min-w-full"
      role="img"
      :aria-label="targetAriaLabel"
    >
      <!-- Cabeçalho da coluna de cordas soltas -->
      <text
        :x="OPEN_COL / 2"
        :y="MARGIN"
        text-anchor="middle"
        font-size="11"
        class="fill-muted-foreground"
      >
        {{ t("drills.fretboard.openLabel") }}
      </text>

      <template v-for="inlay in inlays" :key="inlay.key">
        <circle v-for="(cy, index) in inlay.cy" :key="`${inlay.key}-${index}`" :cx="inlay.cx" :cy="cy" r="3"
          class="fill-muted" />
      </template>

      <line
        v-for="s in strings"
        :key="`str-${s.key}`"
        :x1="s.x1"
        :y1="s.y1"
        :x2="s.x2"
        :y2="s.y2"
        class="stroke-border"
        :stroke-width="s.strokeWidth"
      />

      <text
        v-for="s in strings"
        :key="`str-label-${s.key}`"
        :x="s.labelX"
        :y="s.labelY"
        text-anchor="middle"
        dominant-baseline="central"
        font-size="11"
        class="fill-muted-foreground"
      >
        {{ s.label }}
      </text>

      <line
        v-for="f in frets"
        :key="`fret-${f.fret}`"
        :x1="f.x1"
        :y1="f.y1"
        :x2="f.x2"
        :y2="f.y2"
        class="stroke-border"
        stroke-width="1"
      />

      <line :x1="OPEN_COL" :y1="MARGIN + HEADER_ROW" :x2="OPEN_COL" :y2="height - MARGIN + HEADER_ROW" class="stroke-muted-foreground" stroke-width="3" />

      <text
        v-for="f in frets"
        :key="`label-${f.fret}`"
        :x="f.labelX"
        :y="f.labelY"
        text-anchor="middle"
        font-size="11"
        class="fill-muted-foreground"
      >
        {{ f.fret }}
      </text>

      <!-- Anel pulsante: chama atenção para a casa-alvo sem revelar a nota. -->
      <circle
        :cx="targetPoint.cx"
        :cy="targetPoint.cy"
        :r="NOTE_RADIUS + 6"
        class="pointer-events-none fill-none stroke-brand animate-note-id-pulse"
        stroke-width="2"
      />
      <circle
        :cx="targetPoint.cx"
        :cy="targetPoint.cy"
        :r="NOTE_RADIUS"
        class="pointer-events-none fill-brand stroke-brand"
        stroke-width="2"
      />
    </svg>
  </div>
</template>

<style scoped>
@keyframes note-id-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.15;
  }
}

.animate-note-id-pulse {
  animation: note-id-pulse 1.6s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}
</style>
