<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { FretPosition } from "@music-workspace/music-theory";

const props = defineProps<{
  positions: FretPosition[][];
  foundKeys: Set<string>;
  wrongKey: string | null;
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
const NOTE_RADIUS = 12;

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

/** Cordas graves são visualmente mais grossas que as agudas, como no violão real. */
function strokeWidthFor(stringIndex: number): number {
  const count = stringCount.value;
  if (count <= 1) return 1.5;

  return 1 + ((count - 1 - stringIndex) / (count - 1)) * 1.5;
}

const strings = computed(() =>
  Array.from({ length: stringCount.value }, (_, row) => {
    const displayRow = stringCount.value - 1 - row;
    const y = MARGIN + displayRow * STRING_GAP;
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
      y1: MARGIN,
      x2: x,
      y2: height.value - MARGIN,
      labelX: OPEN_COL + FRET_WIDTH * (fret - 0.5),
      labelY: height.value - MARGIN + 16,
    };
  }),
);

const middleY = computed(() => MARGIN + ((stringCount.value - 1) * STRING_GAP) / 2);

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
      :aria-label="t('drills.fretboard.ariaLabel')"
    >
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
