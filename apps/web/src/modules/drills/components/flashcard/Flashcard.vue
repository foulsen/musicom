<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { useTypingGuardedKeydown } from "@/modules/shared/application/use-typing-guarded-keydown";

import type { LeitnerGrade } from "../../application/leitner";

const props = withDefaults(
  defineProps<{
    prompt: string;
    answer: string;
    /** Contexto curto acima do prompt (ex.: "Name this interval") — o que o baralho pede. */
    context?: string;
    revealed: boolean;
    box?: number;
    boxCount?: number;
    position?: number;
    total?: number;
  }>(),
  { context: undefined, box: 1, boxCount: 5, position: 1, total: 1 },
);

const emit = defineEmits<{
  reveal: [];
  grade: [grade: LeitnerGrade];
}>();

const { t } = useI18n();

function onKeydown(event: KeyboardEvent) {
  if (!props.revealed && event.code === "Space") {
    event.preventDefault();
    emit("reveal");
    return;
  }

  if (!props.revealed) return;

  if (event.key === "1") {
    emit("grade", "again");
  } else if (event.key === "2") {
    emit("grade", "hard");
  } else if (event.key === "3") {
    emit("grade", "good");
  }
}

useTypingGuardedKeydown(onKeydown);
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between text-xs text-muted-foreground">
      <span>{{ t("drills.flashcards.cardPosition", { position, total }) }}</span>

      <span class="flex items-center gap-1" :aria-label="t('drills.flashcards.box', { box, total: boxCount })">
        <span
          v-for="dot in boxCount"
          :key="dot"
          class="size-1.5 rounded-full"
          :class="dot <= box ? 'bg-brand' : 'bg-muted'"
        />
      </span>
    </div>

    <div class="flex min-h-56 flex-col items-center justify-center gap-6 rounded-xl border border-border bg-card/40 p-8 text-center">
      <div class="space-y-1.5">
        <p v-if="context" class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {{ context }}
        </p>
        <p class="text-3xl font-semibold text-foreground">
          {{ prompt }}
        </p>
      </div>

      <div class="flex min-h-14 items-center justify-center">
        <transition
          enter-active-class="transition-opacity duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
        >
          <p v-if="revealed" class="text-lg text-muted-foreground">
            {{ answer }}
          </p>
        </transition>
      </div>

      <button
        v-if="!revealed"
        type="button"
        class="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        @click="emit('reveal')"
      >
        {{ t("drills.flashcards.reveal") }}
      </button>

      <div v-else class="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          class="rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          @click="emit('grade', 'again')"
        >
          {{ t("drills.flashcards.again") }}
        </button>

        <button
          type="button"
          class="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          @click="emit('grade', 'hard')"
        >
          {{ t("drills.flashcards.hard") }}
        </button>

        <button
          type="button"
          class="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          @click="emit('grade', 'good')"
        >
          {{ t("drills.flashcards.gotIt") }}
        </button>
      </div>
    </div>

    <p class="text-center text-xs text-muted-foreground">
      {{ t("drills.flashcards.shortcutHint") }}
    </p>
  </div>
</template>
