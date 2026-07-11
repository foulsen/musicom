<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { EmptyState } from "@/modules/shared/components/empty-state";

const { t } = useI18n();
</script>

<template>
  <section class="flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
    <empty-state :title="t('common.notFound.title')" :description="t('common.notFound.description')" />

    <router-link
      to="/"
      class="inline-flex w-fit items-center rounded-md bg-brand px-4 py-1.5 text-sm font-medium text-brand-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {{ t("common.notFound.backHome") }}
    </router-link>
  </section>
</template>
