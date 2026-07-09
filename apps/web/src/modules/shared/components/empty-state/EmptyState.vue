<script setup lang="ts">
import { Music2 } from "@lucide/vue";

defineProps<{
  title: string;
  description: string;
}>();
</script>

<template>
  <div class="flex flex-col items-start gap-2 rounded-xl border border-dashed border-border bg-card/20 px-4 py-6">
    <music2 class="size-5 text-muted-foreground" />

    <p class="text-sm font-medium text-foreground">
      {{ title }}
    </p>

    <p class="text-sm text-muted-foreground">
      {{ description }}
    </p>
  </div>
</template>
