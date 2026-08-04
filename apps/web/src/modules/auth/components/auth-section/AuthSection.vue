<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import { useAuthStore } from "../../application/use-auth-store";
import { AccountPanel } from "../account-panel";
import { LoginForm } from "../login-form";
import { RegisterForm } from "../register-form";

const { t } = useI18n();
const authStore = useAuthStore();

const mode = ref<"register" | "login">("register");
</script>

<template>
  <div class="flex flex-col gap-3">
    <span class="text-xs font-medium text-muted-foreground">{{ t("auth.sectionTitle") }}</span>

    <AccountPanel v-if="authStore.isAuthenticated" />

    <RegisterForm
      v-else-if="mode === 'register'"
      @switch-to-login="mode = 'login'"
    />
    <LoginForm
      v-else
      @switch-to-register="mode = 'register'"
    />
  </div>
</template>
