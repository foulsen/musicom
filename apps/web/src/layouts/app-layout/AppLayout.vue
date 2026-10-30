<script setup lang="ts">
import { ref } from "vue";
import { RouterView } from "vue-router";
import { useI18n } from "vue-i18n";

import { DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from "reka-ui";
import { Menu as MenuIcon } from "@lucide/vue";

import { AppSidebar } from "@/modules/navigation/components/app-sidebar";

const { t } = useI18n();

const drawerOpen = ref(false);
</script>

<template>
  <div class="flex h-screen bg-background">
    <app-sidebar class="hidden md:flex" />

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex items-center gap-3 border-b bg-sidebar px-4 py-3 md:hidden">
        <button
          type="button"
          class="rounded-md p-2 text-sidebar-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          :aria-label="t('nav.openSidebar')"
          @click="drawerOpen = true"
        >
          <menu-icon class="size-5" />
        </button>

        <span class="text-sm font-semibold tracking-wide">MUSICOM</span>
      </header>

      <main class="flex-1 overflow-auto">
        <div class="mx-auto max-w-6xl">
          <router-view v-slot="{ Component }">
            <suspense v-if="Component">
              <component :is="Component" />

              <template #fallback>
                <div class="flex flex-col gap-8 p-4 sm:p-6 lg:p-8" aria-hidden="true">
                  <div class="h-7 w-56 animate-pulse rounded-md bg-muted" />
                  <div class="h-4 w-80 max-w-full animate-pulse rounded-md bg-muted" />
                  <div class="h-40 animate-pulse rounded-xl bg-muted" />
                </div>
              </template>
            </suspense>
          </router-view>
        </div>
      </main>
    </div>

    <dialog-root v-model:open="drawerOpen">
      <dialog-portal>
        <dialog-overlay class="fixed inset-0 z-40 bg-black/50" />
        <dialog-content
          class="fixed inset-y-0 left-0 z-50 w-64 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
        >
          <dialog-title class="sr-only">{{ t("nav.openSidebar") }}</dialog-title>
          <app-sidebar variant="drawer" @navigate="drawerOpen = false" />
        </dialog-content>
      </dialog-portal>
    </dialog-root>
  </div>
</template>
