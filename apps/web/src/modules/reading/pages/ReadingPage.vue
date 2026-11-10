<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

import { parseReadingQuery } from "../application/reading-link";
import {
  READING_EXERCISES,
  type DictationLevelId,
  type KeySignatureLevelId,
  type NoteReadingLevelId,
  type ReadingExercise,
  type RhythmLevelId,
} from "../application/reading-types";
import { useReadingStore } from "../application/use-reading-store";
import { DictationPanel } from "../components/dictation-panel";
import { KeySignaturePanel } from "../components/key-signature-panel";
import { NoteReadingPanel } from "../components/note-reading-panel";
import { RhythmReadingPanel } from "../components/rhythm-reading-panel";
import { ChipToggleGroup, ChipToggleItem } from "@/modules/shared/components/chip-toggle-group";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = useReadingStore();

/** Aba ativa reflete `route.query.tab`: sobrevive à navegação e é linkável. */
const section = computed<ReadingExercise>(() => parseReadingQuery(route.query).tab ?? "notes");

function setSection(value: unknown) {
  const next = Array.isArray(value) ? value[0] : value;
  if (typeof next !== "string" || !next) return;

  router.replace({ query: { ...route.query, tab: next } });
}

// Deep-link das lições (`?tab=<exercício>&level=<nível>`): grava o nível no campo da aba
// e limpa só o `level` da URL (a aba continua na query, como no resto da página).
onMounted(() => {
  const { tab, level } = parseReadingQuery(route.query);

  if (tab && level) {
    if (tab === "notes") store.noteLevel = level as NoteReadingLevelId;
    else if (tab === "rhythm") store.rhythmLevel = level as RhythmLevelId;
    else if (tab === "dictation") store.dictationLevel = level as DictationLevelId;
    else store.keyLevel = level as KeySignatureLevelId;
  }

  if ("level" in route.query) {
    const { level: _level, ...rest } = route.query;
    router.replace({ query: rest });
  }
});
</script>

<template>
  <section class="flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
    <header class="space-y-1">
      <h1 class="text-2xl font-medium tracking-wide">
        {{ t("reading.title") }}
      </h1>
      <p class="text-sm text-muted-foreground">
        {{ t("reading.subtitle") }}
      </p>
    </header>

    <chip-toggle-group
      :model-value="section"
      type="single"
      :aria-label="t('reading.title')"
      class="w-fit"
      @update:model-value="setSection"
    >
      <chip-toggle-item
        v-for="exercise in READING_EXERCISES"
        :key="exercise"
        :value="exercise"
        class="px-3 py-1.5 text-sm"
      >
        {{ t(`reading.tabs.${exercise}`) }}
      </chip-toggle-item>
    </chip-toggle-group>

    <note-reading-panel v-if="section === 'notes'" />
    <rhythm-reading-panel v-else-if="section === 'rhythm'" />
    <dictation-panel v-else-if="section === 'dictation'" />
    <key-signature-panel v-else />
  </section>
</template>
