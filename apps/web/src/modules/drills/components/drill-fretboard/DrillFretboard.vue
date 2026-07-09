<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

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

const STRING_GAP = 32;
const FRET_WIDTH = 48;
const LABEL_COL = 20;
const OPEN_COL = LABEL_COL + 40;
const MARGIN = 20;
const HEADER_ROW = 16;
const NOTE_RADIUS = 12;
/** Alvo de toque recomendado (~44px) — bem maior que o círculo visível, invisível. */
const HIT_RADIUS = 22;

/** Casas com inlay tradicional: um ponto (única) ou dois (dupla, na oitava). */
const SINGLE_INLAY_FRETS = new Set([3, 5, 7, 9]);
const DOUBLE_INLAY_FRETS = new Set([12]);

const stringCount = computed(() => props.positions.length);
const fretCount = computed(() => (props.positions[0]?.length ?? 1) - 1);

const width = computed(() => OPEN_COL + fretCount.value * FRET_WIDTH + MARGIN);
const height = computed(() => MARGIN * 2 + (stringCount.value - 1) * STRING_GAP);

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

const cells = computed<Cell[]>(() => {
  const rows = props.positions;
  const count = rows.length;
  const result: Cell[] = [];

  rows.forEach((row, stringIndex) => {
    const displayRow = count - 1 - stringIndex;
    const cy = MARGIN + HEADER_ROW + displayRow * STRING_GAP;
    const stringLabel = row[0]?.pitch.note.toString() ?? "";

    row.forEach((position) => {
      const cx = position.fret === 0 ? OPEN_COL / 2 : OPEN_COL + (position.fret - 0.5) * FRET_WIDTH;
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
    const displayRow = stringCount.value - 1 - row;
    const y = MARGIN + HEADER_ROW + displayRow * STRING_GAP;
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
      labelY: height.value - MARGIN + HEADER_ROW + 16,
    };
  }),
);

const middleY = computed(() => MARGIN + HEADER_ROW + ((stringCount.value - 1) * STRING_GAP) / 2);

interface Inlay {
  key: string;
  cx: number;
  cy: number[];
}

/** Marcadores de casa (3/5/7/9 = um ponto; 12 = dois), centralizados no braço. */
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
  <div class="relative w-full overflow-x-auto">
    <svg
      :viewBox="`0 0 ${width} ${height + HEADER_ROW + 24}`"
      :style="{ width: `${width}px` }"
      class="min-w-full transition-opacity"
      :class="active ? '' : 'opacity-50'"
      role="img"
      :aria-label="t('drills.fretboard.ariaLabel')"
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

    <p class="mt-1 text-xs text-muted-foreground sm:hidden">
      {{ t("drills.fretboard.dragHint") }}
    </p>
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
