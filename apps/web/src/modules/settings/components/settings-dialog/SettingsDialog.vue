<script setup lang="ts">
import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";

import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";
import { Volume2, X } from "@lucide/vue";

import { LOCALE_STORAGE_KEY, type AppLocale } from "@/i18n";

import { Separator } from "@/components/ui/separator";
// `Select` vira `<select>` em kebab-case e colidiria com o elemento nativo;
// por isso o root é importado com alias (mesmo padrão do TuningSelector).
import { Select as SelectRoot, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { INSTRUMENT_IDS, type InstrumentId } from "@/modules/shared/application/instrument-presets";
import { useNoteAudio } from "@/modules/shared/application/use-note-audio";
import { useSyncStore } from "@/modules/shared/application/sync";
import { ChipToggleGroup, ChipToggleItem } from "@/modules/shared/components/chip-toggle-group";

import { useUserStore } from "../../application/use-user-store";

const SYNC_DOT_CLASS: Record<string, string> = {
  idle: "bg-emerald-500",
  syncing: "bg-amber-500 animate-pulse",
  offline: "bg-muted-foreground",
  error: "bg-destructive",
};

const LANGUAGE_OPTIONS: { value: AppLocale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "pt", label: "Português" },
];

defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const { t, locale } = useI18n();
const { masterVolume, instrument } = useNoteAudio();
const { name } = storeToRefs(useUserStore());
const { status: syncStatus } = storeToRefs(useSyncStore());

const syncDotClass = computed(() => SYNC_DOT_CLASS[syncStatus.value] ?? SYNC_DOT_CLASS.offline);

watch(locale, (value) => localStorage.setItem(LOCALE_STORAGE_KEY, value));
</script>

<template>
  <dialog-root :open="open" @update:open="(value) => emit('update:open', value)">
    <dialog-portal>
      <dialog-overlay class="fixed inset-0 z-40 bg-black/50" />
      <dialog-content
        class="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 text-card-foreground shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <dialog-title class="text-lg font-semibold">
              {{ t("settings.title") }}
            </dialog-title>
            <dialog-description class="text-sm text-muted-foreground">
              {{ t("settings.description") }}
            </dialog-description>
          </div>

          <dialog-close
            class="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            :aria-label="t('settings.close')"
          >
            <x class="size-4" />
          </dialog-close>
        </div>

        <separator class="my-4" />

        <div class="flex flex-col gap-2">
          <label for="settings-name" class="text-xs font-medium text-muted-foreground">
            {{ t("settings.name") }}
          </label>
          <input
            id="settings-name"
            v-model="name"
            type="text"
            :placeholder="t('settings.namePlaceholder')"
            class="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <separator class="my-4" />

        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <span class="text-xs font-medium text-muted-foreground">{{ t("common.instrument") }}</span>
            <chip-toggle-group
              :model-value="instrument"
              type="single"
              wrap
              :aria-label="t('common.instrument')"
              @update:model-value="(value) => value && (instrument = value as InstrumentId)"
            >
              <chip-toggle-item
                v-for="id in INSTRUMENT_IDS"
                :key="id"
                :value="id"
                class="px-3 py-1.5 text-xs"
              >
                {{ t(`common.instruments.${id}`) }}
              </chip-toggle-item>
            </chip-toggle-group>
          </div>

          <div class="flex items-center gap-2">
            <volume-2 class="size-4 shrink-0 text-muted-foreground" />
            <input
              v-model.number="masterVolume"
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              :aria-label="t('common.masterVolume')"
              class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-brand"
            />
          </div>
        </div>

        <separator class="my-4" />

        <div class="flex flex-col gap-2">
          <span class="text-xs font-medium text-muted-foreground">{{ t("settings.language") }}</span>
          <select-root v-model="locale">
            <select-trigger class="w-full">
              <select-value />
            </select-trigger>
            <select-content>
              <select-item
                v-for="option in LANGUAGE_OPTIONS"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </select-item>
            </select-content>
          </select-root>
        </div>

        <separator class="my-4" />

        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <span class="size-2 shrink-0 rounded-full" :class="syncDotClass" />
          <span>{{ t(`settings.sync.${syncStatus}`) }}</span>
        </div>
      </dialog-content>
    </dialog-portal>
  </dialog-root>
</template>
