<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import { PlayCircle } from "@lucide/vue";

import { useLearnViewModel } from "../application/use-learn-view-model";
import { GlossaryList } from "../components/glossary-list";
import { TodayPanel } from "../components/today-panel";
import { TrackMap } from "../components/track-map";

const { tracks } = useLearnViewModel();

const router = useRouter();
const { t } = useI18n();

function continueTrack(lessonId: string) {
  router.push(`/learn/${lessonId}`);
}
</script>

<template>
  <section class="flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
    <header class="space-y-1">
      <h1 class="text-2xl font-medium tracking-wide">
        {{ t("learn.title") }}
      </h1>
      <p class="text-sm text-muted-foreground">
        {{ t("learn.subtitle") }}
      </p>
    </header>

    <today-panel />

    <section v-for="view in tracks" :key="view.track.id" class="space-y-3">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {{ t(view.track.titleKey) }}
          </h2>
          <p class="text-sm text-muted-foreground">
            {{ t("learn.trackProgress", { percent: view.progressPercent }) }}
          </p>
        </div>

        <button
          v-if="view.continueLesson"
          type="button"
          class="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-sm transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          @click="continueTrack(view.continueLesson.id)"
        >
          <play-circle class="size-4" />
          {{ t("learn.continue") }}
        </button>
      </header>

      <track-map :lessons="view.lessonsWithStatus" />
    </section>

    <glossary-list />
  </section>
</template>
