<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import { Note, createScale, scalePatternSteps } from "@music-workspace/music-theory";

import { findScalePattern } from "@/modules/shared/application/scale-patterns";
import { resolveChordCard } from "@/modules/shared/application/chord-cards";
import { usePassagePlayback } from "@/modules/shared/application/notation/use-passage-playback";
import { useNoteAudio } from "@/modules/shared/application/use-note-audio";
import { ScaleNotes } from "@/modules/shared/components/scale-notes";
import { ChromaticWheel } from "@/modules/shared/components/chromatic-wheel";
import { HarmonicField } from "@/modules/shared/components/harmonic-field";
import { ChordCard } from "@/modules/shared/components/chord-card";
import { StaffNotation } from "@/modules/shared/components/staff-notation";
import { StepPattern } from "@/modules/shared/components/step-pattern";

import type { InlineVizKind, LessonContext, StaffExample } from "../../application/curriculum";
import { ChordFormulas } from "../chord-formulas";
import { IntervalPair } from "../interval-pair";

const props = withDefaults(
  defineProps<{
    context: LessonContext;
    viz: InlineVizKind[];
    /** Grau (1-based) em destaque no Harmonic Field / usado como acorde do Chord Card. */
    highlightDegree?: number;
    /** Semitons dos intervalos da viz "interval", a partir da tônica do contexto. */
    intervals?: number[];
    /** Nomes (no domínio) das qualidades listadas pela viz "chord-formulas", sobre a tônica do contexto. */
    chordPatterns?: string[];
    /** Rótulos do "step-pattern": graus (1 2 b3…) ou nomes das notas (C D E…). */
    patternLabels?: "degrees" | "notes";
    /** Começa o Harmonic Field em tríades ou em acordes com sétima. */
    fieldMode?: "triads" | "sevenths";
    /** Pautas desenhadas pela viz "staff". */
    staves?: StaffExample[];
  }>(),
  {
    highlightDegree: undefined,
    intervals: () => [],
    chordPatterns: () => [],
    patternLabels: "degrees",
    fieldMode: "triads",
    staves: () => [],
  },
);

const { t } = useI18n();
const { play } = useNoteAudio();
const { isPlaying, activeEventKey, play: playPassage } = usePassagePlayback();

// Só a pauta que está tocando recebe o destaque do evento ativo.
const playingIndex = ref<number | null>(null);

function playStaff(index: number) {
  const example = props.staves[index];
  if (!example?.playback) return;

  const handle = playPassage(example.passage, {
    bpm: example.playback.bpm,
    click: example.playback.click,
    countIn: !!example.playback.click,
  });
  if (handle) playingIndex.value = index;
}

function staffHighlights(index: number): Record<string, "active"> {
  return index === playingIndex.value && isPlaying.value && activeEventKey.value
    ? { [activeEventKey.value]: "active" }
    : {};
}

function staffAriaLabel(example: StaffExample): string {
  return example.captionKey ? t(example.captionKey) : t("glossary.staff.term");
}

const scale = computed(() => createScale(Note.from(props.context.root), findScalePattern(props.context.pattern)));

const notes = computed(() => scale.value.notes());
const degrees = computed(() => scale.value.degrees());
const patternSteps = computed(() => scalePatternSteps(findScalePattern(props.context.pattern)));
const patternLabels = computed(() =>
  degrees.value.map((item) => (props.patternLabels === "notes" ? item.spelled.toString() : item.degree.toString())),
);
const triads = computed(() => scale.value.triads());
const sevenths = computed(() => scale.value.seventhChords());

const harmonicFieldMode = ref<"triads" | "sevenths">(props.fieldMode);
const selectedIndex = ref((props.highlightDegree ?? 1) - 1);

const spelledByPitchClass = computed(() => {
  const map = new Map<number, string>();
  scale.value.spelledNotes().forEach((spelled) => map.set(spelled.pitchClass(), spelled.toString()));
  return map;
});

const activeHarmonicFieldChords = computed(() =>
  harmonicFieldMode.value === "triads" ? triads.value : sevenths.value,
);

const selectedChord = computed(() => activeHarmonicFieldChords.value[selectedIndex.value]);

const selectedChordCard = computed(() =>
  selectedChord.value ? resolveChordCard(selectedChord.value.name) : null,
);

function selectChord(index: number) {
  selectedIndex.value = index;
}
</script>

<template>
  <div class="flex flex-col gap-6 lg:flex-row lg:flex-wrap lg:items-start">
    <scale-notes v-if="viz.includes('scale-notes')" :degrees="degrees" class="lg:w-44 lg:shrink-0" @note-play="play" />

    <div v-if="viz.includes('chromatic-wheel')" class="w-full max-w-xs">
      <chromatic-wheel :root="scale.root" :highlighted-notes="notes" :label-by-pitch-class="spelledByPitchClass"
        @note-play="play" />
    </div>

    <step-pattern v-if="viz.includes('step-pattern')" :steps="patternSteps" :degree-labels="patternLabels" legend
      class="w-full" />

    <div v-if="viz.includes('interval') && intervals.length" class="flex w-full flex-col gap-2 sm:max-w-md">
      <interval-pair v-for="semitones in intervals" :key="semitones" :root="context.root" :semitones="semitones" />
    </div>

    <chord-formulas v-if="viz.includes('chord-formulas') && chordPatterns.length" :root="context.root"
      :patterns="chordPatterns" />

    <harmonic-field v-if="viz.includes('harmonic-field')" v-model:mode="harmonicFieldMode" :triads="triads"
      :sevenths="sevenths" :selected-index="selectedIndex" class="lg:w-64 lg:shrink-0" @select="selectChord" />

    <chord-card v-if="viz.includes('chord-card') && selectedChordCard" :name="selectedChordCard.name"
      :shapes="selectedChordCard.shapes" @note-play="play" />

    <div v-if="viz.includes('staff') && staves.length" class="flex w-full flex-col gap-4">
      <figure v-for="(example, index) in staves" :key="index" class="flex flex-col gap-2">
        <staff-notation :passage="example.passage" :ariaLabel="staffAriaLabel(example)"
          :highlights="staffHighlights(index)" />

        <figcaption v-if="example.captionKey" class="text-sm text-muted-foreground">
          {{ t(example.captionKey) }}
        </figcaption>

        <button v-if="example.playback" type="button" :disabled="isPlaying"
          class="self-start rounded-md border border-border px-3 py-1 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          @click="playStaff(index)">
          {{ isPlaying && playingIndex === index ? t("learn.staff.playing") : t("learn.staff.play") }}
        </button>
      </figure>
    </div>
  </div>
</template>
