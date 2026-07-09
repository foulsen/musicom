<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { Pitch, type Degree, type Note, type SpelledNote } from "@music-workspace/music-theory";

interface ScaleNote {
  note: Note;
  degree: Degree;
  spelled: SpelledNote;
}

defineProps<{
  degrees: ScaleNote[];
}>();

const emit = defineEmits<{
  notePlay: [pitch: Pitch];
}>();

const { t } = useI18n();

/** Oitava fixa apenas para sonorização (a nota em si não carrega oitava no domínio). */
const PLAYBACK_OCTAVE = 4;

function play(note: Note) {
  emit("notePlay", Pitch.from(note.value, PLAYBACK_OCTAVE));
}
</script>

<template>
  <section class="space-y-3">
    <header>
      <h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {{ t("common.notes") }}
      </h2>
    </header>

    <ul class="space-y-1">
      <li
        v-for="item in degrees"
        :key="item.degree.toString()"
      >
        <button
          type="button"
          class="w-full rounded-md px-2 py-1.5 text-left leading-tight transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          @click="play(item.note)"
        >
          <p class="text-lg font-semibold text-foreground">
            {{ item.spelled }}
          </p>

          <p class="text-sm text-muted-foreground">
            {{ item.degree.intervalName() }}
          </p>
        </button>
      </li>
    </ul>
  </section>
</template>
