<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import { ToggleGroupItem, ToggleGroupRoot } from "reka-ui";

import { CHROMATIC_SCALE, Interval, Note, Pitch } from "@music-workspace/music-theory";

const props = withDefaults(
  defineProps<{
    root: Note;
    /** Notas destacadas (escala ou acorde atual), pertencentes ou não à roda. */
    highlightedNotes: Note[];
    /** Grafia por classe de altura (ex.: da escala selecionada), para rotular fora do padrão sustenido. */
    labelByPitchClass?: Map<number, string>;
  }>(),
  { labelByPitchClass: undefined },
);

const emit = defineEmits<{
  notePlay: [pitch: Pitch];
}>();

const { t } = useI18n();

const PLAYBACK_OCTAVE = 4;

const mode = ref<"chromatic" | "interval">("chromatic");

const SHORT_INTERVAL_NAMES: Record<number, string> = {
  0: "R",
  1: "m2",
  2: "M2",
  3: "m3",
  4: "M3",
  5: "P4",
  6: "TT",
  7: "P5",
  8: "m6",
  9: "M6",
  10: "m7",
  11: "M7",
};

const SIZE = 300;
const CENTER = SIZE / 2;
const RING_RADIUS = 118;
const NOTE_RADIUS = 20;

interface WheelNote {
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

    return {
      note,
      label: props.labelByPitchClass?.get(note.index()) ?? note.toString(),
      cx: CENTER + RING_RADIUS * Math.cos(angle),
      cy: CENTER + RING_RADIUS * Math.sin(angle),
      isRoot: note.equals(props.root),
      isHighlighted: props.highlightedNotes.some((highlighted) => highlighted.equals(note)),
      semitonesFromRoot,
      intervalName: new Interval(semitonesFromRoot).name(),
      shortInterval: SHORT_INTERVAL_NAMES[semitonesFromRoot] ?? `${semitonesFromRoot}`,
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

function play(note: Note) {
  emit("notePlay", Pitch.from(note.value, PLAYBACK_OCTAVE));
}
</script>

<template>
  <section class="space-y-3">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {{ t("chromaticWheel.title") }}
      </h2>

      <toggle-group-root
        v-model="mode"
        type="single"
        :aria-label="t('chromaticWheel.title')"
        class="inline-flex gap-1 rounded-lg border border-border bg-card/40 p-1"
      >
        <toggle-group-item
          value="chromatic"
          class="rounded-md px-3 py-1 text-xs font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=on]:bg-brand-soft data-[state=on]:text-brand-soft-foreground"
        >
          {{ t("chromaticWheel.chromaticMode") }}
        </toggle-group-item>
        <toggle-group-item
          value="interval"
          class="rounded-md px-3 py-1 text-xs font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=on]:bg-brand-soft data-[state=on]:text-brand-soft-foreground"
        >
          {{ t("chromaticWheel.intervalMode") }}
        </toggle-group-item>
      </toggle-group-root>
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
      <template v-if="mode === 'interval' && rootNode">
        <g v-for="node in nodes.filter((n) => n.isHighlighted && !n.isRoot)" :key="`spoke-${node.note.toString()}`">
          <line
            :x1="rootNode.cx"
            :y1="rootNode.cy"
            :x2="node.cx"
            :y2="node.cy"
            class="stroke-brand/50"
            stroke-width="1.5"
          />
          <text
            :x="(rootNode.cx + node.cx) / 2"
            :y="(rootNode.cy + node.cy) / 2"
            text-anchor="middle"
            dominant-baseline="central"
            font-size="10"
            class="fill-brand-soft-foreground font-medium"
          >
            {{ node.shortInterval }}
          </text>
        </g>
      </template>

      <!-- Notas -->
      <g
        v-for="node in nodes"
        :key="node.note.toString()"
        class="cursor-pointer outline-none"
        tabindex="0"
        role="button"
        :aria-label="`${node.label} · ${node.intervalName}`"
        @click="play(node.note)"
        @keydown.enter="play(node.note)"
        @keydown.space.prevent="play(node.note)"
      >
        <circle
          :cx="node.cx"
          :cy="node.cy"
          :r="NOTE_RADIUS"
          :class="
            node.isRoot
              ? 'fill-brand stroke-brand'
              : node.isHighlighted
                ? 'fill-brand-soft stroke-brand'
                : 'fill-muted stroke-border'
          "
          stroke-width="2"
        />
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
  </section>
</template>
