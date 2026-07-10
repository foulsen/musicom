<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { ArrowLeft } from "@lucide/vue";

defineProps<{
  lessonId: string;
}>();

const { t } = useI18n();
</script>

<template>
  <router-link
    :to="`/learn/${lessonId}`"
    class="inline-flex w-fit items-center gap-1.5 rounded-md border border-border bg-card/40 px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <arrow-left class="size-3.5" />
    {{ t("common.backToLesson") }}
  </router-link>
</template>
