<script setup lang="ts">
import { computed, ref } from "vue";

import type { Pitch } from "@music-workspace/music-theory";

import type { ChordShape } from "../../types/chord-shape";

const props = defineProps<{
  shape: ChordShape;
}>();

const emit = defineEmits<{
  notePlay: [pitch: Pitch];
}>();

// Geometria em unidades do viewBox — bem menor que o fretboard (nota r=7.5).
const STRING_COUNT = 6;
const STRING_GAP = 19;
const FRET_WIDTH = 25;
const OPEN_COL = 20;
const RADIUS = 7.5;
const PAD = { top: 12, right: 10, left: 6 };

const openPosition = computed(() => props.shape.openPosition);
const fretCount = computed(() => props.shape.fretCount);
const baseFret = computed(() => props.shape.baseFret);

const nutX = computed(() => PAD.left + (openPosition.value ? OPEN_COL : 0));
const topY = PAD.top;
const bottomY = PAD.top + (STRING_COUNT - 1) * STRING_GAP;
const rightX = computed(() => nutX.value + fretCount.value * FRET_WIDTH);

const bottomPad = computed(() => (openPosition.value ? 10 : 22));
const width = computed(() => rightX.value + PAD.right);
const height = computed(() => bottomY + bottomPad.value);

const stringYs = computed(() =>
  Array.from({ length: STRING_COUNT }, (_, row) => PAD.top + row * STRING_GAP),
);

const fretLines = computed(() =>
  // Linhas de traste: da esquerda (nut/janela) até a direita, uma por casa.
  Array.from({ length: fretCount.value + 1 }, (_, i) => nutX.value + i * FRET_WIDTH),
);

const fretNumbers = computed(() =>
  Array.from({ length: fretCount.value }, (_, i) => ({
    label: baseFret.value + i,
    x: nutX.value + (i + 0.5) * FRET_WIDTH,
  })),
);

interface Cell {
  key: string;
  cx: number;
  cy: number;
  label: string;
  pitch: Pitch;
}

const cells = computed<Cell[]>(() =>
  props.shape.notes.map((note) => {
    // Corda mais aguda (1ª/e) no topo: inverte a ordem física do domínio.
    const displayRow = STRING_COUNT - 1 - note.string;
    const cy = PAD.top + displayRow * STRING_GAP;

    const cx =
      note.fret === 0
        ? PAD.left + OPEN_COL / 2
        : nutX.value + (note.fret - baseFret.value + 0.5) * FRET_WIDTH;

    return {
      key: `${note.string}-${note.fret}`,
      cx,
      cy,
      label: note.label,
      pitch: note.pitch,
    };
  }),
);

const hovered = ref<string | null>(null);
</script>

<template>
  <svg
    :viewBox="`0 0 ${width} ${height}`"
    class="w-full"
    role="img"
    aria-label="Chord voicing"
  >
    <!-- Cordas -->
    <line
      v-for="(y, row) in stringYs"
      :key="`string-${row}`"
      :x1="nutX"
      :y1="y"
      :x2="rightX"
      :y2="y"
      class="stroke-muted-foreground/40"
      stroke-width="1"
    />

    <!-- Trastes -->
    <line
      v-for="(x, i) in fretLines"
      :key="`fret-${i}`"
      :x1="x"
      :y1="topY"
      :x2="x"
      :y2="bottomY"
      class="stroke-muted-foreground/40"
      stroke-width="1"
    />

    <!-- Pestana (nut) — apenas em posição aberta -->
    <line
      v-if="openPosition"
      :x1="nutX"
      :y1="topY"
      :x2="nutX"
      :y2="bottomY"
      class="stroke-muted-foreground"
      stroke-width="2.5"
    />

    <!-- Números das casas — apenas quando a janela não começa na pestana -->
    <template v-if="!openPosition">
      <text
        v-for="fret in fretNumbers"
        :key="`label-${fret.label}`"
        :x="fret.x"
        :y="bottomY + 16"
        text-anchor="middle"
        font-size="9"
        class="fill-muted-foreground"
      >
        {{ fret.label }}
      </text>
    </template>

    <!-- Notas -->
    <g
      v-for="cell in cells"
      :key="cell.key"
      class="cursor-pointer"
      @mouseenter="hovered = cell.key"
      @mouseleave="hovered = null"
      @click="emit('notePlay', cell.pitch)"
    >
      <circle
        :cx="cell.cx"
        :cy="cell.cy"
        :r="hovered === cell.key ? RADIUS + 1.5 : RADIUS"
        class="fill-brand-soft stroke-brand"
        stroke-width="1.5"
      />
      <text
        :x="cell.cx"
        :y="cell.cy"
        text-anchor="middle"
        dominant-baseline="central"
        font-size="8"
        class="fill-brand-foreground"
      >
        {{ cell.label }}
      </text>
    </g>
  </svg>
</template>
