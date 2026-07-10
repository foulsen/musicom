<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";

import { AudioWaveform, Settings as SettingsIcon } from "@lucide/vue";

import { Separator } from "@/components/ui/separator";

import { SettingsDialog } from "@/modules/settings/components/settings-dialog";
import { useUserStore } from "@/modules/settings/application/use-user-store";

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

const { t } = useI18n();
const { name } = storeToRefs(useUserStore());

const settingsOpen = ref(false);

const displayName = computed(() => name.value.trim() || t("common.guest"));

const initials = computed(() => {
  const words = name.value.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  return words.map((word) => word[0]!.toUpperCase()).join("");
});
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

    <separator />

    <footer class="p-3">
      <button
        type="button"
        class="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :aria-label="t('settings.open')"
        @click="settingsOpen = true"
      >
        <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/15 text-sm font-semibold text-brand">
          {{ initials || "?" }}
        </span>
        <span class="flex min-w-0 flex-1 flex-col">
          <span class="truncate text-sm font-medium">{{ displayName }}</span>
          <span class="text-xs text-sidebar-foreground/60">{{ t("settings.title") }}</span>
        </span>
        <settings-icon class="size-4 shrink-0 text-sidebar-foreground/50" />
      </button>
    </footer>

    <settings-dialog v-model:open="settingsOpen" />
  </aside>
</template>
