<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { BookOpen } from "@lucide/vue";

defineProps<{
  /** Rota da lição (ou da página das trilhas, quando nenhuma lição cobre a seleção atual). */
  to: string;
}>();

const { t } = useI18n();
</script>

<template>
  <router-link
    :to="to"
    class="inline-flex w-fit items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-brand transition-colors hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <book-open class="size-4" aria-hidden="true" />
    {{ t("common.learnAboutThis") }}
  </router-link>
</template>
