<script setup lang="ts">
import { AudioWaveform } from "@lucide/vue";

import { Separator } from "@/components/ui/separator";

import { NavigationItem } from "../navigation-item";

import { navigation } from "../../navigation";

withDefaults(
  defineProps<{
    /** "sidebar": braço fixo no desktop. "drawer": conteúdo do menu dentro do Dialog mobile. */
    variant?: "sidebar" | "drawer";
  }>(),
  { variant: "sidebar" },
);

const emit = defineEmits<{
  navigate: [];
}>();
</script>

<template>
  <aside
    :class="[
      'flex flex-col bg-sidebar text-sidebar-foreground',
      variant === 'sidebar' ? 'h-screen w-64 border-r' : 'h-full w-full',
    ]"
  >
    <header class="flex items-center gap-2 px-6 py-5">
      <audio-waveform class="size-5 text-brand" />

      <h1 class="text-lg font-semibold tracking-wide">
        MUSICOM
      </h1>
    </header>

    <separator />

    <nav class="flex flex-1 flex-col gap-1 p-3" @click="emit('navigate')">
      <navigation-item
        v-for="item in navigation"
        :key="item.to"
        :item="item"
      />
    </nav>
  </aside>
</template>
