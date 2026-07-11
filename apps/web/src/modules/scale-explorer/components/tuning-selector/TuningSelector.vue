<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { Tuning } from "@music-workspace/music-theory";

const { t } = useI18n();

// `Select` vira `<select>` em kebab-case e colidiria com o elemento nativo;
// por isso o root é importado com alias.
import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const props = defineProps<{
  tunings: Tuning[];
}>();

const model = defineModel<Tuning>({ required: true });

const selectedName = computed<string>({
  get: () => model.value.name,
  set: (name) => {
    const tuning = props.tunings.find((tuning) => tuning.name === name);

    if (tuning) {
      model.value = tuning;
    }
  },
});
</script>

<template>
  <section class="space-y-3">
    <header>
      <h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {{ t("tuning.label") }}
      </h2>
    </header>

    <select-root v-model="selectedName">
      <select-trigger class="w-full">
        <select-value :placeholder="t('tuning.placeholder')" />
      </select-trigger>

      <select-content>
        <select-item
          v-for="tuning in tunings"
          :key="tuning.name"
          :value="tuning.name"
        >
          {{ tuning.name }}
        </select-item>
      </select-content>
    </select-root>
  </section>
</template>
