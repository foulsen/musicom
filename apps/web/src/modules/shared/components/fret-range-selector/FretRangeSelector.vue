<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { ChipToggleGroup, ChipToggleItem } from "@/modules/shared/components/chip-toggle-group";

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
  <chip-toggle-group
    v-model="selected"
    type="single"
    :aria-label="t('common.fretRange')"
  >
    <chip-toggle-item
      v-for="option in FRET_OPTIONS"
      :key="option"
      :value="option.toString()"
      class="px-3 py-1 text-xs"
    >
      {{ t("common.frets", { count: option }) }}
    </chip-toggle-item>
  </chip-toggle-group>
</template>
