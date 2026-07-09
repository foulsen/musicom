<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";

import type { NavigationItem as NavigationItemType } from "../../types/navigation-item";

import {
  navigationItemVariants,
} from ".";
interface Props {
  item: NavigationItemType;
}

defineProps<Props>();

const { t } = useI18n();
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

      {{ t(item.titleKey) }}
    </a>
  </router-link>
</template>