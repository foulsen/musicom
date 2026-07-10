<script setup lang="ts">
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

import { EmptyState } from "@/modules/shared/components/empty-state";

const route = useRoute();
const { t } = useI18n();
</script>

<template>
  <section class="flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
    <router-link
      to="/learn"
      class="inline-flex w-fit items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      {{ t("learn.lesson.backToTracks") }}
    </router-link>

    <header class="space-y-1">
      <h1 class="text-2xl font-medium tracking-wide">
        {{ route.params.lessonId }}
      </h1>
    </header>

    <empty-state :title="t('learn.comingSoon.title')" :description="t('learn.comingSoon.description')" />
  </section>
</template>
