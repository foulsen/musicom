<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  glossaryDefinitionKey,
  glossaryTermKey,
  type GlossaryTermId,
} from "@/modules/shared/application/glossary";

defineProps<{
  /** Identificador do termo em `glossary.<id>` (nome e definição nos locales). */
  id: GlossaryTermId;
}>();

const { t } = useI18n();
</script>

<template>
  <!-- Botão (não hover): abre com clique, toque ou Enter/Espaço; fecha com Esc ou clique fora. -->
  <popover>
    <popover-trigger
      class="cursor-help rounded-sm text-left underline decoration-dotted decoration-1 underline-offset-4 outline-none transition-colors hover:decoration-solid focus-visible:ring-2 focus-visible:ring-ring"
    >
      <slot>{{ t(glossaryTermKey(id)) }}</slot>
    </popover-trigger>

    <popover-content
      :aria-label="t(glossaryTermKey(id))"
      class="space-y-1 text-left text-sm font-normal normal-case tracking-normal"
    >
      <p class="font-semibold text-foreground">
        {{ t(glossaryTermKey(id)) }}
      </p>

      <p class="leading-relaxed text-muted-foreground">
        {{ t(glossaryDefinitionKey(id)) }}
      </p>
    </popover-content>
  </popover>
</template>
