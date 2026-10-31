<script setup lang="ts">
import { computed, ref } from "vue";

import { Note, createScale, scalePatternSteps } from "@music-workspace/music-theory";

import { findScalePattern } from "@/modules/shared/application/scale-patterns";
import { resolveChordCard } from "@/modules/shared/application/chord-cards";
import { useNoteAudio } from "@/modules/shared/application/use-note-audio";
import { ScaleNotes } from "@/modules/shared/components/scale-notes";
import { ChromaticWheel } from "@/modules/shared/components/chromatic-wheel";
import { HarmonicField } from "@/modules/shared/components/harmonic-field";
import { ChordCard } from "@/modules/shared/components/chord-card";
import { StepPattern } from "@/modules/shared/components/step-pattern";

import type { InlineVizKind, LessonContext } from "../../application/curriculum";
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
  }>(),
  { highlightDegree: undefined, intervals: () => [], chordPatterns: () => [], patternLabels: "degrees", fieldMode: "triads" },
);

const { play } = useNoteAudio();

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
  </div>
</template>
