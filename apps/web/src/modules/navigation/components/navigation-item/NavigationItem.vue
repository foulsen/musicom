<script setup lang="ts">
import { computed } from "vue";
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
  /** Contador opcional (ex.: revisões pendentes); 0/ausente não mostra nada. */
  badge?: number;
}

const props = defineProps<Props>();

const { t } = useI18n();

const MAX_BADGE = 99;

const badgeText = computed(() => ((props.badge ?? 0) > MAX_BADGE ? `${MAX_BADGE}+` : String(props.badge ?? 0)));

/** Texto acessível do contador ("3 revisões pendentes") — vazio quando não há badge. */
const badgeLabel = computed(() => ((props.badge ?? 0) > 0 ? t("nav.dueReviews", { count: props.badge }, props.badge ?? 0) : ""));

/** No rail recolhido o rótulo vira aria-label do link inteiro, então o contador entra junto. */
const collapsedLabel = computed(() => (badgeLabel.value ? `${t(props.item.titleKey)}, ${badgeLabel.value}` : t(props.item.titleKey)));
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
      :class="[navigationItemVariants({ active: isActive, collapsed }), collapsed && 'relative']"
      :title="collapsed ? collapsedLabel : undefined"
      :aria-label="collapsed ? collapsedLabel : undefined"
    >
      <component
        :is="item.icon"
        class="size-4 shrink-0"
      />

      <span v-if="!collapsed">{{ t(item.titleKey) }}</span>

      <!-- Expandido: pílula à direita do rótulo. Recolhido: bolinha sobre o canto do ícone. -->
      <template v-if="badgeLabel">
        <span
          aria-hidden="true"
          :class="[
            'flex items-center justify-center rounded-full bg-brand text-[10px] font-semibold leading-none text-brand-foreground tabular-nums',
            collapsed ? 'absolute right-1 top-0.5 min-w-4 px-1 py-0.5' : 'ml-auto min-w-5 px-1.5 py-1',
          ]"
        >{{ badgeText }}</span>
        <span v-if="!collapsed" class="sr-only">{{ badgeLabel }}</span>
      </template>
    </a>
  </router-link>
</template>
