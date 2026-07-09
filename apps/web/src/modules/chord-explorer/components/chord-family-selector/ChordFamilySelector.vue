<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { ToggleGroupItem, ToggleGroupRoot } from "reka-ui";

import type { ChordFamily } from "@music-workspace/music-theory";

const props = defineProps<{
  families: ChordFamily[];
}>();

const { t } = useI18n();

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
      <h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {{ t("chordExplorer.chordFamily") }}
      </h2>
    </header>

    <toggle-group-root
      v-model="selectedName"
      type="single"
      class="grid w-full max-w-2xl grid-cols-2 gap-1 rounded-xl border border-border bg-card/40 p-2 sm:flex"
    >
      <toggle-group-item
        v-for="family in families"
        :key="family.name"
        :value="family.name"
        :disabled="family.isEmpty()"
        class="h-10 rounded-lg border border-transparent text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-muted-foreground sm:flex-1 data-[state=on]:border-brand-soft data-[state=on]:bg-brand-soft data-[state=on]:text-brand-soft-foreground"
      >
        {{ family.name }}
      </toggle-group-item>
    </toggle-group-root>
  </section>
</template>
