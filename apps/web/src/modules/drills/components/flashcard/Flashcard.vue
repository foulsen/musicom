<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";

const props = withDefaults(
  defineProps<{
    prompt: string;
    answer: string;
    revealed: boolean;
    box?: number;
    boxCount?: number;
    position?: number;
    total?: number;
  }>(),
  { box: 1, boxCount: 5, position: 1, total: 1 },
);

const emit = defineEmits<{
  reveal: [];
  grade: [correct: boolean];
}>();

const { t } = useI18n();

function onKeydown(event: KeyboardEvent) {
  if (event.target instanceof HTMLElement && ["INPUT", "TEXTAREA"].includes(event.target.tagName)) return;

  if (!props.revealed && event.code === "Space") {
    event.preventDefault();
    emit("reveal");
    return;
  }

  if (props.revealed && event.key === "1") {
    emit("grade", false);
  } else if (props.revealed && event.key === "2") {
    emit("grade", true);
  }
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));
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
      <p class="text-3xl font-semibold text-foreground">
        {{ prompt }}
      </p>

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

    <p class="text-center text-xs text-muted-foreground">
      {{ t("drills.flashcards.shortcutHint") }}
    </p>
  </div>
</template>
