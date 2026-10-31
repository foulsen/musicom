<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { glossaryTermKey } from "@/modules/shared/application/glossary";
import { parseGlossaryMarkup } from "@/modules/shared/application/glossary-markup";
import { GlossaryTerm } from "@/modules/shared/components/glossary-term";

const props = defineProps<{
  /** Texto já traduzido, com marcações `[[id]]` ou `[[id:texto]]` (ver `glossary-markup.ts`). */
  text: string;
}>();

const { t } = useI18n();

const segments = computed(() => parseGlossaryMarkup(props.text));
</script>

<template>
  <template v-for="(segment, index) in segments" :key="index">
    <template v-if="segment.type === 'text'">{{ segment.text }}</template>
    <glossary-term v-else :id="segment.id">{{ segment.label ?? t(glossaryTermKey(segment.id)) }}</glossary-term>
  </template>
</template>
