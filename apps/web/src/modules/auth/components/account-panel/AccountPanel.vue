<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import { Button } from "@/components/ui/button";

import { useAuthStore } from "../../application/use-auth-store";

const { t } = useI18n();
const authStore = useAuthStore();

const isLoggingOut = ref(false);

async function onLogout(): Promise<void> {
  isLoggingOut.value = true;

  try {
    await authStore.logout();
  } finally {
    isLoggingOut.value = false;
  }
}
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <span class="text-sm">{{ t("auth.loggedInAs", { email: authStore.user?.email }) }}</span>
    <Button variant="outline" size="sm" :disabled="isLoggingOut" @click="onLogout">
      {{ isLoggingOut ? t("auth.loggingOut") : t("auth.logout") }}
    </Button>
  </div>
</template>
