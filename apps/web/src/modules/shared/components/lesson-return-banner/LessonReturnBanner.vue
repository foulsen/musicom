<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import { ArrowLeft } from "@lucide/vue";

const props = defineProps<{
  lessonId: string;
}>();

const { t } = useI18n();
const route = useRoute();

// O passo de origem viaja na query (`step`, preservada por `useExplorerDeeplink`): volta ao mesmo passo.
const lessonLink = computed(() => {
  const step = route.query.step;

  return typeof step === "string" && /^\d+$/.test(step)
    ? { path: `/learn/${props.lessonId}`, query: { step } }
    : `/learn/${props.lessonId}`;
});
</script>

<template>
  <router-link
    :to="lessonLink"
    class="inline-flex w-fit items-center gap-1.5 rounded-md border border-border bg-card/40 px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <arrow-left class="size-3.5" />
    {{ t("common.backToLesson") }}
  </router-link>
</template>
