<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import { Play } from "@lucide/vue";

import type { Pitch } from "@music-workspace/music-theory";

import type { ChordShape } from "../../types/chord-shape";

const props = defineProps<{
  shape: ChordShape;
}>();

const emit = defineEmits<{
  notePlay: [pitch: Pitch];
  chordPlay: [pitches: Pitch[]];
}>();

const { t } = useI18n();

function playWholeChord() {
  emit(
    "chordPlay",
    props.shape.notes.map((note) => note.pitch),
  );
}

// Geometria em unidades do viewBox — bem menor que o fretboard (nota r=7.5).
const STRING_COUNT = 6;
const STRING_GAP = 19;
const FRET_WIDTH = 25;
const OPEN_COL = 20;
const RADIUS = 7.5;
const PAD = { top: 12, right: OPEN_COL, left: 0 };

const openPosition = computed(() => props.shape.openPosition);
const fretCount = computed(() => props.shape.fretCount);
const baseFret = computed(() => props.shape.baseFret);

// Reserva sempre a coluna de cordas soltas (à esquerda da pestana) e a faixa de
// números, mesmo quando não são usadas, para que todas as posições de um mesmo
// acorde tenham exatamente o mesmo tamanho (tendo soltas ou não).
const NUMBERS_ROW = 22;

const nutX = PAD.left + OPEN_COL;
const topY = PAD.top;
const bottomY = PAD.top + (STRING_COUNT - 1) * STRING_GAP;
const rightX = computed(() => nutX + fretCount.value * FRET_WIDTH);

const width = computed(() => rightX.value + PAD.right);
const height = bottomY + NUMBERS_ROW;

const stringYs = computed(() =>
  Array.from({ length: STRING_COUNT }, (_, row) => PAD.top + row * STRING_GAP),
);

const fretLines = computed(() =>
  // Linhas de traste: da esquerda (nut/janela) até a direita, uma por casa.
  Array.from({ length: fretCount.value + 1 }, (_, i) => nutX + i * FRET_WIDTH),
);

const fretNumbers = computed(() =>
  Array.from({ length: fretCount.value }, (_, i) => ({
    label: baseFret.value + i,
    x: nutX + (i + 0.5) * FRET_WIDTH,
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
        : nutX + (note.fret - baseFret.value + 0.5) * FRET_WIDTH;

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
</script>

<template>
  <div class="flex flex-col items-end gap-1">
    <button
      type="button"
      class="inline-flex items-center gap-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      :aria-label="t('common.playChordShape')"
      @click="playWholeChord"
    >
      <play class="size-3.5" />
    </button>

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
      class="group cursor-pointer outline-none"
      tabindex="0"
      role="button"
      :aria-label="cell.label"
      @mouseenter="hovered = cell.key"
      @mouseleave="hovered = null"
      @focusin="hovered = cell.key"
      @focusout="hovered = null"
      @click="playNote(cell)"
      @keydown.enter="playNote(cell)"
      @keydown.space.prevent="playNote(cell)"
    >
      <circle
        :cx="cell.cx"
        :cy="cell.cy"
        :r="RADIUS + 4"
        class="pointer-events-none fill-none stroke-ring opacity-0 transition-opacity group-focus-visible:opacity-100"
        stroke-width="1.5"
      />
      <circle
        :cx="cell.cx"
        :cy="cell.cy"
        :r="hovered === cell.key || playedKey === cell.key ? RADIUS + 1.5 : RADIUS"
        class="fill-brand-soft stroke-brand transition-all duration-150"
        stroke-width="1.5"
      />
      <circle
        v-if="playedKey === cell.key"
        :cx="cell.cx"
        :cy="cell.cy"
        :r="RADIUS + 1.5"
        class="fill-none stroke-brand"
        stroke-width="1.5"
        opacity="0.6"
      >
        <animate attributeName="r" :from="RADIUS + 1.5" :to="RADIUS + 7" dur="0.3s" fill="freeze" />
        <animate attributeName="opacity" from="0.6" to="0" dur="0.3s" fill="freeze" />
      </circle>
      <text
        :x="cell.cx"
        :y="cell.cy"
        text-anchor="middle"
        dominant-baseline="central"
        font-size="8"
        class="fill-brand-soft-foreground"
      >
        {{ cell.label }}
      </text>
    </g>
    </svg>
  </div>
</template>
