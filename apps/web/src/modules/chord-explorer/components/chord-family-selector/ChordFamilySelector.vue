<script setup lang="ts">
import { computed } from "vue";

import { ToggleGroupItem, ToggleGroupRoot } from "reka-ui";

import type { ChordFamily } from "@music-workspace/music-theory";

const props = defineProps<{
  families: ChordFamily[];
}>();

const model = defineModel<ChordFamily>({ required: true });

const selectedName = computed<string>({
  get: () => model.value.name,
  set: (name) => {
    const family = props.families.find((item) => item.name === name);

    if (family) {
      model.value = family;
    }
  },
});
</script>

<template>
  <section class="space-y-3">
    <header>
      <h2 class="text-xl font-medium text-muted-foreground">
        Family
      </h2>
    </header>

    <toggle-group-root
      v-model="selectedName"
      type="single"
      class="flex w-full max-w-2xl gap-1 rounded-xl border border-border bg-card/40 p-2"
    >
      <toggle-group-item
        v-for="family in families"
        :key="family.name"
        :value="family.name"
        :disabled="family.isEmpty()"
        class="h-10 flex-1 rounded-lg border border-transparent text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-muted-foreground data-[state=on]:border-brand data-[state=on]:bg-brand/10 data-[state=on]:text-foreground"
      >
        {{ family.name }}
      </toggle-group-item>
    </toggle-group-root>
  </section>
</template>
