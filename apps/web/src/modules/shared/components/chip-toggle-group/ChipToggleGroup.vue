<script setup lang="ts">
import type { ToggleGroupRootEmits, ToggleGroupRootProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { reactiveOmit } from "@vueuse/core";
import { ToggleGroupRoot, useForwardPropsEmits } from "reka-ui";

import { cn } from "@/lib/utils";

/**
 * Wrapper fino de `ToggleGroupRoot` com o container "pill" canônico
 * (usado em ChromaticWheel, DrillsPage, EarTrainingPage, HarmonicField,
 * FretRangeSelector e ModeExplorerPage) — evita duplicar as ~5 classes
 * de borda/fundo do grupo em cada tela.
 */
const props = defineProps<
  ToggleGroupRootProps & {
    class?: HTMLAttributes["class"];
    /** Permite quebra de linha (`flex-wrap`) quando os itens não cabem numa única linha. */
    wrap?: boolean;
  }
>();

const emits = defineEmits<ToggleGroupRootEmits>();

const delegatedProps = reactiveOmit(props, "class", "wrap");
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <ToggleGroupRoot
    v-bind="forwarded"
    :class="cn('inline-flex gap-1 rounded-lg border border-border bg-card/40 p-1', wrap && 'flex-wrap', props.class)"
  >
    <slot />
  </ToggleGroupRoot>
</template>
