<script setup lang="ts">
import { RouterView } from "vue-router";

import { AppSidebar } from "@/modules/navigation/components/app-sidebar";
</script>

<template>
  <div class="flex h-screen bg-background">
    <app-sidebar />

    <main class="flex-1 overflow-auto">
      <router-view />
    </main>
  </div>
</template>