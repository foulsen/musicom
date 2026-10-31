<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { Play } from "@lucide/vue";

import { CHORD_FAMILIES, Note, createChord, type SingleNote } from "@music-workspace/music-theory";

import { chordPitches } from "@/modules/shared/application/chord-pitches";
import { useMusicTerms } from "@/modules/shared/application/music-terms";
import { useNoteAudio } from "@/modules/shared/application/use-note-audio";

const props = defineProps<{
  root: SingleNote;
  /** Nomes (no domínio) das qualidades a listar, ex.: "Major 7th". */
  patterns: string[];
}>();

const { t } = useI18n();
const { chordQualityName } = useMusicTerms();
const { playChord } = useNoteAudio();

const allPatterns = CHORD_FAMILIES.flatMap((family) => family.patterns);

const rows = computed(() =>
  props.patterns.flatMap((name) => {
    const pattern = allPatterns.find((item) => item.name === name);
    if (!pattern) return [];

    const chord = createChord(Note.from(props.root), pattern);

    return [
      {
        name,
        symbol: chord.name,
        quality: chordQualityName(pattern),
        formula: pattern.degrees.map((degree) => degree.toString()).join(" – "),
        notes: chord.spelledNotes.map((note) => note.toString()).join(" – "),
        pitches: chordPitches(chord),
      },
    ];
  }),
);
</script>

<template>
  <ul class="grid w-full gap-2 sm:grid-cols-2">
    <li v-for="row in rows" :key="row.name">
      <button
        type="button"
        class="flex h-full w-full items-start gap-3 rounded-lg border border-border bg-card/40 px-4 py-3 text-left transition-colors outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
        :aria-label="t('learn.chordFormulas.play', { chord: row.symbol, quality: row.quality, formula: row.formula, notes: row.notes })"
        @click="playChord(row.pitches, { strum: true })"
      >
        <div class="min-w-0 flex-1 space-y-0.5" aria-hidden="true">
          <p class="text-lg font-semibold text-foreground">
            {{ row.symbol }}
            <span class="text-sm font-normal text-muted-foreground">· {{ row.quality }}</span>
          </p>
          <p class="text-sm text-foreground">{{ row.formula }}</p>
          <p class="text-sm text-muted-foreground">{{ row.notes }}</p>
        </div>

        <play class="mt-1 size-4 shrink-0 text-brand" aria-hidden="true" />
      </button>
    </li>
  </ul>
</template>
