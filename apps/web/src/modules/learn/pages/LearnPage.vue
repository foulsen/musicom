<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { EmptyState } from "@/modules/shared/components/empty-state";

const { t } = useI18n();
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

    <empty-state :title="t('learn.comingSoon.title')" :description="t('learn.comingSoon.description')" />
  </section>
</template>
