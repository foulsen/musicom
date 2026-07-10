<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { Play } from "@lucide/vue";

withDefaults(
  defineProps<{
    bodyKey: string;
    hasCues?: boolean;
    isPlaying?: boolean;
  }>(),
  { hasCues: false, isPlaying: false },
);

const emit = defineEmits<{
  listen: [];
}>();

const { t } = useI18n();
</script>

<template>
  <section class="space-y-4 rounded-xl border border-border bg-card/40 p-6">
    <p class="text-base leading-relaxed text-foreground">
      {{ t(bodyKey) }}
    </p>

    <button
      v-if="hasCues"
      type="button"
      class="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-sm transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      @click="emit('listen')"
    >
      <play class="size-4" :class="{ 'animate-pulse': isPlaying }" />
      {{ t("learn.listen") }}
    </button>
  </section>
</template>
