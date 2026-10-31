<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { useMusicTerms } from "@/modules/shared/application/music-terms";
import type { QuizOption } from "@/modules/shared/application/quiz";

const props = defineProps<{
  options: QuizOption[];
  correctId: string;
  selectedId: string | null;
}>();

const emit = defineEmits<{
  select: [id: string];
}>();

const { locale } = useI18n();
const { label } = useMusicTerms();

/**
 * Os rótulos de termos vêm em minúsculas ("minor third", "terça menor"). Em inglês o `capitalize`
 * (Title Case) é o visual de sempre; em pt, só a primeira letra — "Sétima da dominante", não "Da".
 */
const labelCaseClass = computed(() => (locale.value.startsWith("en") ? "capitalize" : "first-letter:uppercase"));

function stateClass(option: QuizOption, correctId: string, selectedId: string | null): string {
  if (!selectedId) {
    return "border-border bg-card/40 text-foreground hover:bg-accent/40 cursor-pointer";
  }

  if (option.id === correctId) {
    return "border-brand bg-brand-soft text-brand-soft-foreground cursor-default";
  }

  if (option.id === selectedId) {
    return "border-destructive bg-destructive/10 text-destructive cursor-default";
  }

  return "border-border bg-card/20 text-muted-foreground opacity-60 cursor-default";
}

/**
 * Mantém os botões focáveis (para navegação/leitura por teclado) mesmo depois de
 * respondido; usa `aria-disabled` + ignora o clique, em vez de `disabled` real,
 * que removeria o foco do teclado do elemento (WCAG 4.1.3).
 */
function handleClick(optionId: string) {
  if (props.selectedId !== null) return;

  emit("select", optionId);
}
</script>

<template>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <button
      v-for="(option, index) in options"
      :key="option.id"
      type="button"
      :aria-disabled="selectedId !== null"
      class="rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
      :class="stateClass(option, correctId, selectedId)"
      @click="handleClick(option.id)"
    >
      <span
        aria-hidden="true"
        class="mr-2 inline-flex size-5 items-center justify-center rounded border border-current/30 align-middle text-[10px] font-semibold opacity-70"
      >{{ index + 1 }}</span>
      <span class="inline-block" :class="labelCaseClass">{{ label(option.label) }}</span>
    </button>
  </div>
</template>
