<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";

import type { NavigationItem as NavigationItemType } from "../../types/navigation-item";

import {
  navigationItemVariants,
} from ".";
interface Props {
  item: NavigationItemType;
  /** Rail recolhido: só o ícone, com o título como tooltip/aria-label. */
  collapsed?: boolean;
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
      :class="navigationItemVariants({ active: isActive, collapsed })"
      :title="collapsed ? t(item.titleKey) : undefined"
      :aria-label="collapsed ? t(item.titleKey) : undefined"
    >
      <component
        :is="item.icon"
        class="size-4 shrink-0"
      />

      <span v-if="!collapsed">{{ t(item.titleKey) }}</span>
    </a>
  </router-link>
</template>
