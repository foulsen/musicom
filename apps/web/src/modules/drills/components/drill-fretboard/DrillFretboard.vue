<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useMediaQuery } from "@vueuse/core";

import type { FretPosition } from "@music-workspace/music-theory";

const props = defineProps<{
  positions: FretPosition[][];
  foundKeys: Set<string>;
  wrongKey: string | null;
  /** Enquanto false (antes do "Start"), o braço fica visualmente inerte e não recebe cliques. */
  active: boolean;
}>();

const emit = defineEmits<{
  guess: [position: FretPosition];
}>();

const { t } = useI18n();

/** Abaixo de `md`, o braço vira vertical (pestana no topo) — mesmo breakpoint do FretboardDiagram,
 * para não exigir rolagem horizontal durante um jogo cronometrado. */
const isVertical = useMediaQuery("(max-width: 767px)");

// Geometria em eixos abstratos: "along" = ao longo do braço (pestana → última casa),
// "across" = através das cordas. `toScreen` decide, por orientação, qual eixo vira X e
// qual vira Y — mesma técnica do FretboardDiagram.
const STRING_GAP = 32;
const FRET_WIDTH = 48;
const ALONG_NUT = 84;
const ALONG_LABEL = 20;
const MARGIN = 20;
const HEADER_ROOM = 16;
const ACROSS_START = MARGIN + HEADER_ROOM;
const FRET_LABEL_GAP = 30;
const TRAILING = 20;
const NOTE_RADIUS = 12;
/** Alvo de toque recomendado (~44px) — bem maior que o círculo visível, invisível. */
const HIT_RADIUS = 22;

/** Casas com inlay tradicional: um ponto (única) ou dois (dupla, na oitava). */
const SINGLE_INLAY_FRETS = new Set([3, 5, 7, 9]);
const DOUBLE_INLAY_FRETS = new Set([12]);

const stringCount = computed(() => props.positions.length);
const fretCount = computed(() => (props.positions[0]?.length ?? 1) - 1);

function toScreen(along: number, across: number) {
  return isVertical.value ? { x: across, y: along } : { x: along, y: across };
}

const acrossLastString = computed(() => ACROSS_START + (stringCount.value - 1) * STRING_GAP);
const acrossExtent = computed(() => acrossLastString.value + FRET_LABEL_GAP + TRAILING);
const alongExtent = computed(() => ALONG_NUT + fretCount.value * FRET_WIDTH + TRAILING);

const width = computed(() => (isVertical.value ? acrossExtent.value : alongExtent.value));
const height = computed(() => (isVertical.value ? alongExtent.value : acrossExtent.value));

const nut = computed(() => {
  const start = toScreen(ALONG_NUT, ACROSS_START);
  const end = toScreen(ALONG_NUT, acrossLastString.value);
  return { x1: start.x, y1: start.y, x2: end.x, y2: end.y };
});

const header = computed(() => toScreen(ALONG_NUT / 2, MARGIN));

function keyFor(position: FretPosition): string {
  return `${position.string}-${position.fret}`;
}

interface Cell {
  key: string;
  cx: number;
  cy: number;
  position: FretPosition;
  stringLabel: string;
  ariaLabel: string;
}

/** Índice de exibição de uma corda: horizontal inverte (aguda no topo); vertical não (grave no topo). */
function displayRowFor(stringIndex: number): number {
  return isVertical.value ? stringIndex : stringCount.value - 1 - stringIndex;
}

const cells = computed<Cell[]>(() => {
  const rows = props.positions;
  const result: Cell[] = [];

  rows.forEach((row, stringIndex) => {
    const across = ACROSS_START + displayRowFor(stringIndex) * STRING_GAP;
    const stringLabel = row[0]?.pitch.note.toString() ?? "";

    row.forEach((position) => {
      const along = position.fret === 0 ? ALONG_NUT / 2 : ALONG_NUT + (position.fret - 0.5) * FRET_WIDTH;
      const { x: cx, y: cy } = toScreen(along, across);
      const ariaLabel =
        position.fret === 0
          ? t("drills.fretboard.cellAriaLabelOpen", { string: stringLabel })
          : t("drills.fretboard.cellAriaLabel", { string: stringLabel, fret: position.fret });

      result.push({ key: keyFor(position), cx, cy, position, stringLabel, ariaLabel });
    });
  });

  return result;
});

/** Cordas graves são visualmente mais grossas que as agudas, como no violão real. */
function strokeWidthFor(stringIndex: number): number {
  const count = stringCount.value;
  if (count <= 1) return 1.5;

  return 1 + ((count - 1 - stringIndex) / (count - 1)) * 1.5;
}

const strings = computed(() =>
  Array.from({ length: stringCount.value }, (_, row) => {
    const across = ACROSS_START + displayRowFor(row) * STRING_GAP;
    const start = toScreen(ALONG_NUT, across);
    const end = toScreen(alongExtent.value - TRAILING, across);
    const label = toScreen(ALONG_LABEL, across);
    const text = props.positions[row]?.[0]?.pitch.note.toString() ?? "";

    return {
      key: row,
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
      strokeWidth: strokeWidthFor(row),
      labelX: label.x,
      labelY: label.y,
      label: text,
    };
  }),
);

const frets = computed(() =>
  Array.from({ length: fretCount.value }, (_, i) => {
    const fret = i + 1;
    const along = ALONG_NUT + fret * FRET_WIDTH;
    const start = toScreen(along, ACROSS_START);
    const end = toScreen(along, acrossLastString.value);
    const label = toScreen(ALONG_NUT + FRET_WIDTH * (fret - 0.5), acrossLastString.value + FRET_LABEL_GAP);

    return { fret, x1: start.x, y1: start.y, x2: end.x, y2: end.y, labelX: label.x, labelY: label.y };
  }),
);

const middleAcross = computed(() => ACROSS_START + ((stringCount.value - 1) * STRING_GAP) / 2);

interface Inlay {
  key: string;
  points: { x: number; y: number }[];
}

/** Marcadores de casa (3/5/7/9 = um ponto; 12 = dois), centralizados no braço. */
const inlays = computed<Inlay[]>(() =>
  Array.from({ length: fretCount.value }, (_, i) => i + 1)
    .filter((fret) => SINGLE_INLAY_FRETS.has(fret) || DOUBLE_INLAY_FRETS.has(fret))
    .map((fret) => {
      const along = ALONG_NUT + FRET_WIDTH * (fret - 0.5);

      if (DOUBLE_INLAY_FRETS.has(fret)) {
        return {
          key: `inlay-${fret}`,
          points: [
            toScreen(along, middleAcross.value - STRING_GAP / 2),
            toScreen(along, middleAcross.value + STRING_GAP / 2),
          ],
        };
      }

      return { key: `inlay-${fret}`, points: [toScreen(along, middleAcross.value)] };
    }),
);

function cellState(cell: Cell): "found" | "wrong" | "idle" {
  if (props.foundKeys.has(cell.key)) return "found";
  if (props.wrongKey === cell.key) return "wrong";
  return "idle";
}

function cellClass(cell: Cell): string {
  const state = cellState(cell);
  if (state === "found") return "fill-brand stroke-brand";
  if (state === "wrong") return "fill-destructive/20 stroke-destructive animate-drill-shake";
  return "fill-muted stroke-border group-hover:fill-accent";
}

function onGuess(cell: Cell) {
  if (!props.active) return;
  emit("guess", cell.position);
}

function onKeydown(event: KeyboardEvent, cell: Cell) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  onGuess(cell);
}
</script>

<template>
  <div :class="isVertical ? 'relative w-full' : 'relative w-full overflow-x-auto'">
    <svg
      :viewBox="`0 0 ${width} ${height}`"
      :style="isVertical ? {} : { width: `${width}px` }"
      :class="[isVertical ? 'h-auto w-full' : 'min-w-full', 'transition-opacity', active ? '' : 'opacity-50']"
      role="img"
      :aria-label="t('drills.fretboard.ariaLabel')"
    >
      <!-- Cabeçalho da coluna de cordas soltas -->
      <text
        :x="header.x"
        :y="header.y"
        text-anchor="middle"
        font-size="11"
        class="fill-muted-foreground"
      >
        {{ t("drills.fretboard.openLabel") }}
      </text>

      <template v-for="inlay in inlays" :key="inlay.key">
        <circle v-for="(point, index) in inlay.points" :key="`${inlay.key}-${index}`" :cx="point.x" :cy="point.y" r="3"
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

      <line :x1="nut.x1" :y1="nut.y1" :x2="nut.x2" :y2="nut.y2" class="stroke-muted-foreground" stroke-width="3" />

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

      <g
        v-for="cell in cells"
        :key="cell.key"
        class="group cursor-pointer outline-none"
        :tabindex="active ? 0 : -1"
        role="button"
        :aria-label="cell.ariaLabel"
        :aria-pressed="foundKeys.has(cell.key)"
        @click="onGuess(cell)"
        @keydown="onKeydown($event, cell)"
      >
        <!-- Área de toque invisível, maior que o círculo visível -->
        <circle :cx="cell.cx" :cy="cell.cy" :r="HIT_RADIUS" fill="transparent" />

        <!-- Anel de foco visível (teclado) -->
        <circle
          :cx="cell.cx"
          :cy="cell.cy"
          :r="NOTE_RADIUS + 5"
          class="pointer-events-none fill-none stroke-ring opacity-0 transition-opacity group-focus-visible:opacity-100"
          stroke-width="2"
        />

        <circle
          :cx="cell.cx"
          :cy="cell.cy"
          :r="NOTE_RADIUS"
          class="pointer-events-none transition-all"
          :class="[cellClass(cell), cellState(cell) === 'found' ? 'animate-drill-pop' : '']"
          stroke-width="2"
        />
      </g>
    </svg>

    <div
      v-if="!active"
      class="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <p class="rounded-md bg-popover px-3 py-1.5 text-sm font-medium text-popover-foreground shadow-sm">
        {{ t("drills.fretboard.pressStart") }}
      </p>
    </div>
  </div>
</template>

<style scoped>
@keyframes drill-shake {
  0%, 100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-2px);
  }
  40% {
    transform: translateX(2px);
  }
  60% {
    transform: translateX(-1px);
  }
  80% {
    transform: translateX(1px);
  }
}

@keyframes drill-pop {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.35);
  }
  100% {
    transform: scale(1);
  }
}

.animate-drill-shake {
  animation: drill-shake 0.5s ease-in-out;
  transform-box: fill-box;
  transform-origin: center;
}

.animate-drill-pop {
  animation: drill-pop 0.3s ease-out;
  transform-box: fill-box;
  transform-origin: center;
}
</style>
