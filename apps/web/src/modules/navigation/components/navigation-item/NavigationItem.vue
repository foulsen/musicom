<script setup lang="ts">
import { RouterLink } from "vue-router";

import { cn } from "@/lib/utils";

import type { NavigationItem as NavigationItemType } from "../../types/navigation-item";

import {
  navigationItemVariants,
} from ".";
interface Props {
  item: NavigationItemType;
}

defineProps<Props>();
</script>

<template>
  <router-link
    :to="item.to"
    custom
    v-slot="{ href, navigate, isActive }"
  >
    <a
      :href="href"
      @click="navigate"
      :class="navigationItemVariants({ active: isActive })"
    >
      <component
        :is="item.icon"
        class="size-4 shrink-0"
      />

      {{ item.title }}
    </a>
  </router-link>
</template>