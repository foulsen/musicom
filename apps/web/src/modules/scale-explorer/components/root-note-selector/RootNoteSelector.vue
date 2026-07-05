<script setup lang="ts">
import { computed } from "vue";

import { ToggleGroupItem, ToggleGroupRoot } from "reka-ui";

import { CHROMATIC_SCALE, Note } from "@music-workspace/music-theory";
import type { SingleNote } from "@music-workspace/music-theory";

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
      <h2 class="text-xl font-medium text-muted-foreground">
        Root note
      </h2>
    </header>

    <toggle-group-root
      v-model="selectedNote"
      type="single"
      class="flex w-full gap-1 rounded-xl border border-border bg-card/40 p-2"
    >
      <toggle-group-item
        v-for="note in CHROMATIC_SCALE"
        :key="note"
        :value="note"
        class="h-10 flex-1 rounded-lg border border-transparent text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=on]:border-brand data-[state=on]:bg-brand/10 data-[state=on]:text-foreground"
      >
        {{ note }}
      </toggle-group-item>
    </toggle-group-root>
  </section>
</template>
