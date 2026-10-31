<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { ChevronDown } from "@lucide/vue";

import {
  GLOSSARY_TERM_IDS,
  glossaryDefinitionKey,
  glossaryTermKey,
} from "@/modules/shared/application/glossary";

const { t, locale } = useI18n();

/** Termos em ordem alfabética do idioma atual. */
const entries = computed(() =>
  GLOSSARY_TERM_IDS.map((id) => ({
    id,
    term: t(glossaryTermKey(id)),
    definition: t(glossaryDefinitionKey(id)),
  })).sort((a, b) => a.term.localeCompare(b.term, locale.value)),
);
</script>

<template>
  <details class="group rounded-xl border border-border bg-card/20">
    <summary
      class="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden"
    >
      <span class="space-y-0.5">
        <span class="block text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {{ t("glossaryList.title") }}
        </span>
        <span class="block text-sm text-muted-foreground">
          {{ t("glossaryList.hint") }}
        </span>
      </span>

      <chevron-down class="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
    </summary>

    <dl class="grid grid-cols-1 gap-x-8 gap-y-4 px-4 pb-4 pt-1 md:grid-cols-2">
      <div v-for="entry in entries" :key="entry.id" class="space-y-0.5">
        <dt class="text-sm font-semibold text-foreground">
          {{ entry.term }}
        </dt>
        <dd class="text-sm leading-relaxed text-muted-foreground">
          {{ entry.definition }}
        </dd>
      </div>
    </dl>
  </details>
</template>
