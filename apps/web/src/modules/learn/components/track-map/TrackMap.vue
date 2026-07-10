<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";

import { CheckCircle2, Circle, Lock, PlayCircle } from "@lucide/vue";

import type { LessonWithStatus } from "../../application/use-learn-view-model";

defineProps<{
  lessons: LessonWithStatus[];
}>();

const { t } = useI18n();

const STATUS_ICON = {
  locked: Lock,
  available: Circle,
  "in-progress": PlayCircle,
  completed: CheckCircle2,
} as const;

const STATUS_CLASS = {
  locked: "border-border bg-card/20 text-muted-foreground opacity-60",
  available: "border-border bg-card/40 text-foreground hover:bg-accent/40",
  "in-progress": "border-brand-soft bg-brand-soft/40 text-foreground hover:bg-brand-soft/60",
  completed: "border-brand bg-brand-soft text-brand-soft-foreground hover:opacity-90",
} as const;
</script>

<template>
  <ol class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
    <li v-for="{ lesson, status } in lessons" :key="lesson.id">
      <component
        :is="status === 'locked' ? 'div' : RouterLink"
        :to="status === 'locked' ? undefined : `/learn/${lesson.id}`"
        class="flex h-full flex-col gap-2 rounded-lg border px-4 py-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :class="STATUS_CLASS[status]"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-base font-medium">{{ t(lesson.titleKey) }}</span>
          <component :is="STATUS_ICON[status]" class="size-4 shrink-0" aria-hidden="true" />
        </div>

        <p class="text-sm opacity-80">
          {{ t(lesson.summaryKey) }}
        </p>

        <span class="text-xs font-medium uppercase tracking-wide opacity-70">
          {{ t(`learn.status.${status}`) }}
        </span>
      </component>
    </li>
  </ol>
</template>
