<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { AudioWaveform, Volume2 } from "@lucide/vue";

import { Separator } from "@/components/ui/separator";

import { INSTRUMENT_IDS, type InstrumentId } from "@/modules/shared/application/instrument-presets";
import { useNoteAudio } from "@/modules/shared/application/use-note-audio";
import { ChipToggleGroup, ChipToggleItem } from "@/modules/shared/components/chip-toggle-group";

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

const { masterVolume, instrument } = useNoteAudio();
const { t } = useI18n();
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

    <footer class="flex flex-col gap-3 px-6 py-4">
      <div class="flex flex-col gap-2">
        <span class="text-xs font-medium text-sidebar-foreground/70">{{ t("common.instrument") }}</span>
        <chip-toggle-group
          :model-value="instrument"
          type="single"
          orientation="vertical"
          class="w-full flex-col items-stretch"
          :aria-label="t('common.instrument')"
          @update:model-value="(value) => value && (instrument = value as InstrumentId)"
        >
          <chip-toggle-item
            v-for="id in INSTRUMENT_IDS"
            :key="id"
            :value="id"
            class="px-3 py-1.5 text-left text-xs"
          >
            {{ t(`common.instruments.${id}`) }}
          </chip-toggle-item>
        </chip-toggle-group>
      </div>

      <div class="flex items-center gap-2">
        <volume-2 class="size-4 shrink-0 text-sidebar-foreground/70" />
        <input
          v-model.number="masterVolume"
          type="range"
          min="0"
          max="0.5"
          step="0.01"
          :aria-label="t('common.masterVolume')"
          class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-sidebar-foreground/20 accent-brand"
        />
      </div>
    </footer>
  </aside>
</template>
