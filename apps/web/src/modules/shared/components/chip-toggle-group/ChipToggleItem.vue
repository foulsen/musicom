<script setup lang="ts">
import type { ToggleGroupItemProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { reactiveOmit } from "@vueuse/core";
import { ToggleGroupItem, useForwardProps } from "reka-ui";

import { cn } from "@/lib/utils";

/**
 * Wrapper fino de `ToggleGroupItem` com o estilo "chip" canônico.
 * Tamanho de texto/padding (`text-xs`/`text-sm`, `py-1`/`py-1.5`, `px-2.5`/`px-3`)
 * varia entre usos — passe pela prop `class` normal do Vue, que é mesclada por
 * cima da base via `cn()` (twMerge resolve o conflito de utilitários).
 */
const props = defineProps<
  ToggleGroupItemProps & {
    class?: HTMLAttributes["class"];
  }
>();

const delegatedProps = reactiveOmit(props, "class");
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <ToggleGroupItem
    v-bind="forwardedProps"
    :class="
      cn(
        'rounded-md font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=on]:bg-brand-soft data-[state=on]:text-brand-soft-foreground',
        props.class,
      )
    "
  >
    <slot />
  </ToggleGroupItem>
</template>
