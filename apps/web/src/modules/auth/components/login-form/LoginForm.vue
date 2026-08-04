<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useAuthStore } from "../../application/use-auth-store";

const emit = defineEmits<{
  "switch-to-register": [];
}>();

const { t } = useI18n();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const isSubmitting = ref(false);
const errorMessage = ref<string | null>(null);

async function onSubmit(): Promise<void> {
  errorMessage.value = null;
  isSubmitting.value = true;

  try {
    await authStore.login({ email: email.value.trim(), password: password.value });
  } catch (error) {
    if (error instanceof ApiError) {
      errorMessage.value = error.status === 401 ? t("auth.invalidCredentials") : t("auth.genericError");
    } else {
      errorMessage.value = t("auth.genericError");
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <form class="flex flex-col gap-3" @submit.prevent="onSubmit">
    <div class="flex flex-col gap-1.5">
      <label for="auth-login-email" class="text-xs font-medium text-muted-foreground">
        {{ t("auth.emailLabel") }}
      </label>
      <Input
        id="auth-login-email"
        v-model="email"
        type="email"
        autocomplete="email"
        required
        :placeholder="t('auth.emailPlaceholder')"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <label for="auth-login-password" class="text-xs font-medium text-muted-foreground">
        {{ t("auth.passwordLabel") }}
      </label>
      <Input
        id="auth-login-password"
        v-model="password"
        type="password"
        autocomplete="current-password"
        required
        :placeholder="t('auth.passwordPlaceholder')"
      />
    </div>

    <p v-if="errorMessage" class="text-xs text-destructive">{{ errorMessage }}</p>

    <Button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? t("auth.loggingIn") : t("auth.login") }}
    </Button>

    <button
      type="button"
      class="text-xs text-muted-foreground underline-offset-4 hover:underline"
      @click="emit('switch-to-register')"
    >
      {{ t("auth.needAccount") }} {{ t("auth.createAccount") }}
    </button>
  </form>
</template>
