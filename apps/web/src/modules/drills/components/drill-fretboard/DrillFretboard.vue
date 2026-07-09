<script setup lang="ts">
import { computed } from "vue";

import type { FretPosition } from "@music-workspace/music-theory";

const props = defineProps<{
  positions: FretPosition[][];
  foundKeys: Set<string>;
  wrongKey: string | null;
}>();

const emit = defineEmits<{
  guess: [position: FretPosition];
}>();

const STRING_GAP = 32;
const FRET_WIDTH = 48;
const OPEN_COL = 40;
const MARGIN = 20;
const NOTE_RADIUS = 12;

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
}

const cells = computed<Cell[]>(() => {
  const rows = props.positions;
  const count = rows.length;
  const result: Cell[] = [];

  rows.forEach((row, stringIndex) => {
    const displayRow = count - 1 - stringIndex;
    const cy = MARGIN + displayRow * STRING_GAP;

    row.forEach((position) => {
      const cx = position.fret === 0 ? OPEN_COL / 2 : OPEN_COL + (position.fret - 0.5) * FRET_WIDTH;
      result.push({ key: keyFor(position), cx, cy, position });
    });
  });

  return result;
});

const strings = computed(() =>
  Array.from({ length: stringCount.value }, (_, row) => {
    const y = MARGIN + row * STRING_GAP;
    return { key: row, x1: OPEN_COL, y1: y, x2: width.value - MARGIN, y2: y };
  }),
);

const frets = computed(() =>
  Array.from({ length: fretCount.value }, (_, i) => {
    const fret = i + 1;
    const x = OPEN_COL + fret * FRET_WIDTH;
    return {
      fret,
      x1: x,
      y1: MARGIN,
      x2: x,
      y2: height.value - MARGIN,
      labelX: OPEN_COL + FRET_WIDTH * (fret - 0.5),
      labelY: height.value - MARGIN + 16,
    };
  }),
);

function cellClass(cell: Cell): string {
  if (props.foundKeys.has(cell.key)) return "fill-brand stroke-brand";
  if (props.wrongKey === cell.key) return "fill-destructive/20 stroke-destructive";
  return "fill-muted stroke-border hover:fill-accent";
}
</script>

<template>
  <div class="w-full overflow-x-auto">
    <svg
      :viewBox="`0 0 ${width} ${height + 24}`"
      :style="{ width: `${width}px` }"
      class="min-w-full"
      role="img"
      aria-label="Fretboard drill"
    >
      <line
        v-for="s in strings"
        :key="`str-${s.key}`"
        :x1="s.x1"
        :y1="s.y1"
        :x2="s.x2"
        :y2="s.y2"
        class="stroke-border"
        stroke-width="1"
      />

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

      <line :x1="OPEN_COL" :y1="MARGIN" :x2="OPEN_COL" :y2="height - MARGIN" class="stroke-muted-foreground" stroke-width="3" />

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

      <circle
        v-for="cell in cells"
        :key="cell.key"
        :cx="cell.cx"
        :cy="cell.cy"
        :r="NOTE_RADIUS"
        class="cursor-pointer transition-colors"
        :class="cellClass(cell)"
        stroke-width="2"
        @click="emit('guess', cell.position)"
      />
    </svg>
  </div>
</template>
