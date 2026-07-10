<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import { CHROMATIC_SCALE, Interval, Note, Pitch } from "@music-workspace/music-theory";
import { ChipToggleGroup, ChipToggleItem } from "@/modules/shared/components/chip-toggle-group";

const props = withDefaults(
  defineProps<{
    root: Note;
    /** Notas destacadas (escala ou acorde atual), pertencentes ou não à roda. */
    highlightedNotes: Note[];
    /** Grafia por classe de altura (ex.: da escala selecionada), para rotular fora do padrão sustenido. */
    labelByPitchClass?: Map<number, string>;
    /** Oitava usada para tocar a nota clicada (ex.: registro do voicing selecionado no Chord Explorer). */
    playbackOctave?: number;
  }>(),
  { labelByPitchClass: undefined, playbackOctave: 4 },
);

const emit = defineEmits<{
  notePlay: [pitch: Pitch];
}>();

const { t } = useI18n();

const mode = ref<"chromatic" | "interval">("chromatic");

const SIZE = 300;
const CENTER = SIZE / 2;
const RING_RADIUS = 118;
const NOTE_RADIUS = 20;
const ROOT_NOTE_RADIUS = 24;

/** Posição do rótulo de intervalo ao longo do raio tônica->nota (0 = na tônica, 1 = na nota). */
const LABEL_ALONG_SPOKE = 0.62;
const LABEL_PERPENDICULAR_OFFSET = 7;

interface WheelNote {
  index: number;
  note: Note;
  label: string;
  cx: number;
  cy: number;
  isRoot: boolean;
  isHighlighted: boolean;
  semitonesFromRoot: number;
  intervalName: string;
  shortInterval: string;
}

const nodes = computed<WheelNote[]>(() =>
  CHROMATIC_SCALE.map((value, index) => {
    const note = Note.from(value);
    const angle = (index / 12) * 2 * Math.PI - Math.PI / 2;

    const semitonesFromRoot = props.root.distanceTo(note);
    const interval = new Interval(semitonesFromRoot);

    return {
      index,
      note,
      label: props.labelByPitchClass?.get(note.index()) ?? note.toString(),
      cx: CENTER + RING_RADIUS * Math.cos(angle),
      cy: CENTER + RING_RADIUS * Math.sin(angle),
      isRoot: note.equals(props.root),
      isHighlighted: props.highlightedNotes.some((highlighted) => highlighted.equals(note)),
      semitonesFromRoot,
      intervalName: interval.name(),
      shortInterval: interval.shortName(),
    };
  }),
);

const rootNode = computed(() => nodes.value.find((node) => node.isRoot));

/** Polígono conectando as notas destacadas na ordem da roda, para mostrar a "forma" transponível. */
const shapePath = computed(() => {
  const highlighted = nodes.value.filter((node) => node.isHighlighted || node.isRoot);
  if (highlighted.length < 2) return null;

  return `M ${highlighted.map((node) => `${node.cx} ${node.cy}`).join(" L ")} Z`;
});

interface Spoke {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  labelX: number;
  labelY: number;
  shortInterval: string;
}

/**
 * Desloca o rótulo ao longo do raio (não no meio exato) e alterna um offset
 * perpendicular por nota — com escalas de 7 notas, spokes vizinhos (m2/M2,
 * m7/M7) saem quase juntos da tônica e seus rótulos colidiam no meio do caminho.
 */
const spokes = computed<Spoke[]>(() => {
  const root = rootNode.value;
  if (!root) return [];

  return nodes.value
    .filter((node) => node.isHighlighted && !node.isRoot)
    .map((node) => {
      const dx = node.cx - root.cx;
      const dy = node.cy - root.cy;
      const length = Math.hypot(dx, dy) || 1;
      const perpX = -dy / length;
      const perpY = dx / length;
      const offsetSign = node.index % 2 === 0 ? 1 : -1;

      return {
        key: `spoke-${node.note.toString()}`,
        x1: root.cx,
        y1: root.cy,
        x2: node.cx,
        y2: node.cy,
        labelX: root.cx + dx * LABEL_ALONG_SPOKE + perpX * LABEL_PERPENDICULAR_OFFSET * offsetSign,
        labelY: root.cy + dy * LABEL_ALONG_SPOKE + perpY * LABEL_PERPENDICULAR_OFFSET * offsetSign,
        shortInterval: node.shortInterval,
      };
    });
});

/** Nota tocada por último: pulsa brevemente como confirmação visual do clique. */
const playedNote = ref<string | null>(null);
let playedTimeout: ReturnType<typeof setTimeout> | undefined;

/** Raio base do nó: a tônica é maior para se distinguir por forma, não só por cor (WCAG 1.4.1). */
function baseRadius(node: WheelNote) {
  return node.isRoot ? ROOT_NOTE_RADIUS : NOTE_RADIUS;
}

function noteRadius(node: WheelNote) {
  return playedNote.value === node.note.value ? baseRadius(node) + 3 : baseRadius(node);
}

function play(note: Note) {
  emit("notePlay", Pitch.from(note.value, props.playbackOctave));

  playedNote.value = note.value;
  clearTimeout(playedTimeout);
  playedTimeout = setTimeout(() => {
    playedNote.value = null;
  }, 300);
}
</script>

<template>
  <section class="space-y-3">
    <header class="flex flex-wrap items-center justify-center gap-3">
      <!-- <h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {{ t("chromaticWheel.title") }}
      </h2> -->

      <chip-toggle-group
        v-model="mode"
        type="single"
        :aria-label="t('chromaticWheel.title')"
      >
        <chip-toggle-item value="chromatic" class="px-3 py-1 text-xs">
          {{ t("chromaticWheel.chromaticMode") }}
        </chip-toggle-item>
        <chip-toggle-item value="interval" class="px-3 py-1 text-xs">
          {{ t("chromaticWheel.intervalMode") }}
        </chip-toggle-item>
      </chip-toggle-group>
    </header>

    <svg
      :viewBox="`0 0 ${SIZE} ${SIZE}`"
      class="mx-auto w-full max-w-xs"
      role="img"
      :aria-label="t('chromaticWheel.title')"
    >
      <circle :cx="CENTER" :cy="CENTER" :r="RING_RADIUS" class="fill-none stroke-border" stroke-width="1" />

      <!-- Forma do acorde/escala selecionada -->
      <path v-if="shapePath" :d="shapePath" class="fill-brand/5 stroke-brand/40" stroke-width="1.5" />

      <!-- Raios de intervalo a partir da tônica -->
      <template v-if="mode === 'interval'">
        <g v-for="spoke in spokes" :key="spoke.key">
          <line :x1="spoke.x1" :y1="spoke.y1" :x2="spoke.x2" :y2="spoke.y2" class="stroke-brand/50" stroke-width="1.5" />
          <text
            :x="spoke.labelX"
            :y="spoke.labelY"
            text-anchor="middle"
            dominant-baseline="central"
            font-size="10"
            class="fill-brand-soft-foreground font-medium"
          >
            {{ spoke.shortInterval }}
          </text>
        </g>
      </template>

      <!-- Notas -->
      <g
        v-for="node in nodes"
        :key="node.note.toString()"
        class="group cursor-pointer outline-none"
        tabindex="0"
        role="button"
        :aria-label="`${node.label} · ${node.intervalName}`"
        @click="play(node.note)"
        @keydown.enter="play(node.note)"
        @keydown.space.prevent="play(node.note)"
      >
        <!-- Anel de foco visível (teclado) -->
        <circle
          :cx="node.cx"
          :cy="node.cy"
          :r="baseRadius(node) + 5"
          class="pointer-events-none fill-none stroke-ring opacity-0 transition-opacity group-focus-visible:opacity-100"
          stroke-width="2"
        />
        <!-- Anel duplo da tônica: distingue por forma, não só por cor -->
        <circle
          v-if="node.isRoot"
          :cx="node.cx"
          :cy="node.cy"
          :r="baseRadius(node) + 3.5"
          class="fill-none stroke-brand"
          stroke-width="1.5"
        />
        <circle
          :cx="node.cx"
          :cy="node.cy"
          :r="noteRadius(node)"
          :class="[
            node.isRoot
              ? 'fill-brand stroke-brand'
              : node.isHighlighted
                ? 'fill-brand-soft stroke-brand'
                : 'fill-muted stroke-border',
            'transition-all duration-150',
          ]"
          stroke-width="2"
        />
        <circle
          v-if="playedNote === node.note.value"
          :cx="node.cx"
          :cy="node.cy"
          :r="baseRadius(node) + 3"
          class="fill-none stroke-brand"
          stroke-width="2"
          opacity="0.6"
        >
          <animate attributeName="r" :from="baseRadius(node) + 3" :to="baseRadius(node) + 12" dur="0.3s" fill="freeze" />
          <animate attributeName="opacity" from="0.6" to="0" dur="0.3s" fill="freeze" />
        </circle>
        <text
          :x="node.cx"
          :y="node.cy"
          text-anchor="middle"
          dominant-baseline="central"
          font-size="13"
          :class="
            node.isRoot
              ? 'fill-brand-foreground'
              : node.isHighlighted
                ? 'fill-brand-soft-foreground'
                : 'fill-muted-foreground'
          "
        >
          {{ node.label }}
        </text>
      </g>
    </svg>

    <p v-if="shapePath" class="text-center text-xs text-muted-foreground">
      {{ t("chromaticWheel.shapeCaption") }}
    </p>
  </section>
</template>
