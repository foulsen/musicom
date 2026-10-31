<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { ArrowRight, Play } from "@lucide/vue";

import { Pitch, type SingleNote } from "@music-workspace/music-theory";

import { intervalLabel, useMusicTerms, withSemitonesLabel } from "@/modules/shared/application/music-terms";
import { useNoteAudio } from "@/modules/shared/application/use-note-audio";

import { spellIntervalAbove } from "../../application/interval-notes";

const props = defineProps<{
  root: SingleNote;
  /** Distância da fundamental até a segunda nota, em semitons (12 = oitava). */
  semitones: number;
}>();

const { t } = useI18n();
const { label } = useMusicTerms();
const { playSequence } = useNoteAudio();

/** Oitava fixa apenas para sonorização (a nota em si não carrega oitava no domínio). */
const PLAYBACK_OCTAVE = 4;

const upper = computed(() => spellIntervalAbove(props.root, props.semitones).toString());
const description = computed(() => label(withSemitonesLabel(intervalLabel(props.semitones), props.semitones)));

function play() {
  const lower = Pitch.from(props.root, PLAYBACK_OCTAVE);

  playSequence([lower, lower.transpose(props.semitones)]);
}
</script>

<template>
  <button
    type="button"
    class="flex items-center gap-4 rounded-lg border border-border bg-card/40 px-4 py-3 text-left transition-colors outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
    :aria-label="t('learn.interval.play', { from: root, to: upper, name: description })"
    @click="play"
  >
    <div class="flex items-center gap-2 text-lg font-semibold text-foreground" aria-hidden="true">
      <span>{{ root }}</span>
      <arrow-right class="size-4 text-muted-foreground" />
      <span>{{ upper }}</span>
    </div>

    <p class="text-sm text-muted-foreground" aria-hidden="true">
      {{ description }}
    </p>

    <play class="ml-auto size-4 shrink-0 text-brand" aria-hidden="true" />
  </button>
</template>
