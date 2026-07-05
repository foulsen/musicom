<script setup lang="ts">
import { computed, ref } from "vue";

import type { Pitch } from "@music-workspace/music-theory";

import type { ChordNote } from "../../types/chord-note";

const props = defineProps<{
  positions: ChordNote[][];
  /** Nome do acorde exibido acima do diagrama (ex.: "Cm"). */
  caption?: string;
}>();

const emit = defineEmits<{
  notePlay: [pitch: Pitch];
}>();

// Geometria em unidades do viewBox — menor que a do fretboard (notas ~8.5 vs 14).
const STRING_GAP = 22;
const FRET_WIDTH = 30;
const OPEN_COL = 24;
const RADIUS = 8.5;
const PAD = { top: 16, bottom: 30, left: 8, right: 12 };

const stringCount = computed(() => props.positions.length);
const fretCount = computed(() => (props.positions[0]?.length ?? 1) - 1);

const nutX = PAD.left + OPEN_COL;
const topY = PAD.top;
const bottomY = computed(() => PAD.top + (stringCount.value - 1) * STRING_GAP);
const rightX = computed(() => nutX + fretCount.value * FRET_WIDTH);
const width = computed(() => rightX.value + PAD.right);
const height = computed(() => bottomY.value + PAD.bottom);

const stringYs = computed(() =>
  Array.from({ length: stringCount.value }, (_, row) => PAD.top + row * STRING_GAP),
);

const frets = computed(() =>
  Array.from({ length: fretCount.value }, (_, i) => {
    const fret = i + 1;
    return { fret, x: nutX + fret * FRET_WIDTH, labelX: nutX + (fret - 0.5) * FRET_WIDTH };
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
}

const CIRCLE_CLASS = {
  root: "fill-brand-soft stroke-brand",
  chord: "fill-muted stroke-brand",
} as const;

const TEXT_CLASS = {
  root: "fill-brand-foreground",
  chord: "fill-foreground",
} as const;

const cells = computed<Cell[]>(() => {
  const rows = props.positions;
  const count = rows.length;
  const result: Cell[] = [];

  rows.forEach((row, stringIndex) => {
    // Corda mais aguda no topo: inverte a ordem física (grave→aguda) do domínio.
    const displayRow = count - 1 - stringIndex;
    const cy = PAD.top + displayRow * STRING_GAP;

    row.forEach((position) => {
      // O diagrama de acorde mostra apenas as notas do acorde.
      if (!position.isRoot && !position.inChord) {
        return;
      }

      const cx =
        position.fret === 0
          ? PAD.left + OPEN_COL / 2
          : nutX + (position.fret - 0.5) * FRET_WIDTH;

      const category = position.isRoot ? "root" : "chord";

      result.push({
        key: `${stringIndex}-${position.fret}`,
        cx,
        cy,
        label: position.label,
        intervalName: position.intervalName,
        pitch: position.pitch,
        circleClass: CIRCLE_CLASS[category],
        textClass: TEXT_CLASS[category],
      });
    });
  });

  return result;
});

const hovered = ref<Cell | null>(null);

const tooltip = computed(() => {
  const cell = hovered.value;
  if (!cell) return null;

  const text = `${cell.label} · ${cell.intervalName}`;
  const boxWidth = text.length * 6 + 12;
  const boxHeight = 18;

  const x = Math.max(4, Math.min(cell.cx - boxWidth / 2, width.value - boxWidth - 4));
  // Acima da nota; se não couber, mostra abaixo.
  const above = cell.cy - RADIUS - 6 - boxHeight;
  const y = above < 2 ? cell.cy + RADIUS + 6 : above;

  return { x, y, width: boxWidth, height: boxHeight, text, cx: x + boxWidth / 2, cy: y + boxHeight / 2 };
});
</script>

<template>
  <figure class="space-y-1">
    <figcaption
      v-if="caption"
      class="text-center text-base font-semibold text-foreground"
    >
      {{ caption }}
    </figcaption>

    <svg
      :viewBox="`0 0 ${width} ${height}`"
      class="w-full"
      role="img"
      :aria-label="caption ? `Chord diagram: ${caption}` : 'Chord diagram'"
    >
      <!-- Cordas -->
      <line
        v-for="(y, row) in stringYs"
        :key="`string-${row}`"
        :x1="nutX"
        :y1="y"
        :x2="rightX"
        :y2="y"
        class="stroke-border"
        stroke-width="1"
      />

      <!-- Trastes -->
      <line
        v-for="fret in frets"
        :key="`fret-${fret.fret}`"
        :x1="fret.x"
        :y1="topY"
        :x2="fret.x"
        :y2="bottomY"
        class="stroke-border"
        stroke-width="1"
      />

      <!-- Pestana (nut) -->
      <line
        :x1="nutX"
        :y1="topY"
        :x2="nutX"
        :y2="bottomY"
        class="stroke-muted-foreground"
        stroke-width="2"
      />

      <!-- Números das casas -->
      <text
        v-for="fret in frets"
        :key="`label-${fret.fret}`"
        :x="fret.labelX"
        :y="bottomY + 22"
        text-anchor="middle"
        font-size="9"
        class="fill-muted-foreground"
      >
        {{ fret.fret }}
      </text>

      <!-- Notas do acorde -->
      <g
        v-for="cell in cells"
        :key="cell.key"
        class="cursor-pointer"
        @mouseenter="hovered = cell"
        @mouseleave="hovered = null"
        @click="emit('notePlay', cell.pitch)"
      >
        <circle
          :cx="cell.cx"
          :cy="cell.cy"
          :r="hovered?.key === cell.key ? RADIUS + 2 : RADIUS"
          :class="cell.circleClass"
          stroke-width="1.5"
        />
        <text
          :x="cell.cx"
          :y="cell.cy"
          text-anchor="middle"
          dominant-baseline="central"
          font-size="8.5"
          :class="cell.textClass"
        >
          {{ cell.label }}
        </text>
      </g>

      <!-- Tooltip (hover) -->
      <g v-if="tooltip" style="pointer-events: none">
        <rect
          :x="tooltip.x"
          :y="tooltip.y"
          :width="tooltip.width"
          :height="tooltip.height"
          rx="5"
          class="fill-popover stroke-border"
          stroke-width="1"
        />
        <text
          :x="tooltip.cx"
          :y="tooltip.cy"
          text-anchor="middle"
          dominant-baseline="central"
          font-size="9"
          class="fill-popover-foreground"
        >
          {{ tooltip.text }}
        </text>
      </g>
    </svg>
  </figure>
</template>
