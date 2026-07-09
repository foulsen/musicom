<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { ToggleGroupItem, ToggleGroupRoot } from "reka-ui";

const FRET_OPTIONS = [12, 15, 24] as const;

const model = defineModel<number>({ required: true });

const { t } = useI18n();

const selected = computed<string>({
  get: () => model.value.toString(),
  set: (value) => {
    const count = Number(value);
    if (count) model.value = count;
  },
});
</script>

<template>
  <toggle-group-root
    v-model="selected"
    type="single"
    :aria-label="t('common.fretRange')"
    class="inline-flex gap-1 rounded-lg border border-border bg-card/40 p-1"
  >
    <toggle-group-item
      v-for="option in FRET_OPTIONS"
      :key="option"
      :value="option.toString()"
      class="rounded-md px-3 py-1 text-xs font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=on]:bg-brand-soft data-[state=on]:text-brand-soft-foreground"
    >
      {{ t("common.frets", { count: option }) }}
    </toggle-group-item>
  </toggle-group-root>
</template>
