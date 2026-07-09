<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { ToggleGroupItem, ToggleGroupRoot } from "reka-ui";

import { CHROMATIC_SCALE, Note } from "@music-workspace/music-theory";
import type { SingleNote } from "@music-workspace/music-theory";

const props = withDefaults(
  defineProps<{
    /** Rótulo do cabeçalho. Default preserva o rótulo genérico ("Root note") usado nas outras páginas. */
    title?: string;
  }>(),
  { title: undefined },
);

const { t } = useI18n();

const heading = computed(() => props.title ?? t("common.rootNote"));

const model = defineModel<Note>({ required: true });

const selectedNote = computed<string>({
  get: () => model.value.value,
  set: (value) => {
    if (value) {
      // Fronteira com a primitiva (string) -> domínio (Note).
      model.value = Note.from(value as SingleNote);
    }
  },
});
</script>

<template>
  <section class="space-y-3">
    <header>
      <h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {{ heading }}
      </h2>
    </header>

    <toggle-group-root
      v-model="selectedNote"
      type="single"
      class="grid w-full max-w-xl grid-cols-6 gap-1 rounded-xl border border-border bg-card/40 p-2 sm:grid-cols-12"
    >
      <toggle-group-item
        v-for="note in CHROMATIC_SCALE"
        :key="note"
        :value="note"
        class="h-10 rounded-lg border border-transparent text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=on]:border-brand-soft data-[state=on]:bg-brand-soft data-[state=on]:text-brand-soft-foreground"
      >
        {{ note }}
      </toggle-group-item>
    </toggle-group-root>
  </section>
</template>
