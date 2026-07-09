<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineProps<{
  prompt: string;
  answer: string;
  revealed: boolean;
}>();

const emit = defineEmits<{
  reveal: [];
  grade: [correct: boolean];
}>();

const { t } = useI18n();
</script>

<template>
  <div class="flex min-h-56 flex-col items-center justify-center gap-6 rounded-xl border border-border bg-card/40 p-8 text-center">
    <p class="text-3xl font-semibold text-foreground">
      {{ prompt }}
    </p>

    <p v-if="revealed" class="text-lg text-muted-foreground">
      {{ answer }}
    </p>

    <button
      v-if="!revealed"
      type="button"
      class="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      @click="emit('reveal')"
    >
      {{ t("drills.flashcards.reveal") }}
    </button>

    <div v-else class="flex gap-3">
      <button
        type="button"
        class="rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        @click="emit('grade', false)"
      >
        {{ t("drills.flashcards.again") }}
      </button>

      <button
        type="button"
        class="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        @click="emit('grade', true)"
      >
        {{ t("drills.flashcards.gotIt") }}
      </button>
    </div>
  </div>
</template>
