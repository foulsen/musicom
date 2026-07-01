<script setup lang="ts">
import { Music } from "@lucide/vue";

import { Separator } from "@/components/ui/separator";

import { NavigationItem } from "../navigation-item";

import { navigation } from "../../navigation";
</script>

<template>
  <aside
    class="flex h-screen w-64 flex-col border-r bg-sidebar text-sidebar-foreground"
  >
    <header class="flex items-center gap-2 px-6 py-5">
      <music class="size-5" />

      <h1 class="text-lg font-semibold tracking-wide">
        MUSICOM
      </h1>
    </header>

    <separator />

    <nav class="flex flex-1 flex-col gap-1 p-3">
      <navigation-item
        v-for="item in navigation"
        :key="item.to"
        :item="item"
      />
    </nav>
  </aside>
</template>