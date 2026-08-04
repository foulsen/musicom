<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useAuthStore } from "../../application/use-auth-store";

const emit = defineEmits<{
  "switch-to-login": [];
}>();

const { t } = useI18n();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const acknowledged = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref<string | null>(null);

async function onSubmit(): Promise<void> {
  errorMessage.value = null;
  isSubmitting.value = true;

  try {
    await authStore.register({ email: email.value.trim(), password: password.value });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 409) {
        const body = error.body as { message?: string } | undefined;
        errorMessage.value = body?.message ?? t("auth.genericError");
      } else if (error.status === 400) {
        errorMessage.value = t("auth.validationError");
      } else {
        errorMessage.value = t("auth.genericError");
      }
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
    <p class="text-sm text-muted-foreground">{{ t("auth.sectionDescription") }}</p>

    <div class="flex flex-col gap-1.5">
      <label for="auth-register-email" class="text-xs font-medium text-muted-foreground">
        {{ t("auth.emailLabel") }}
      </label>
      <Input
        id="auth-register-email"
        v-model="email"
        type="email"
        autocomplete="email"
        required
        :placeholder="t('auth.emailPlaceholder')"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <label for="auth-register-password" class="text-xs font-medium text-muted-foreground">
        {{ t("auth.passwordLabel") }}
      </label>
      <Input
        id="auth-register-password"
        v-model="password"
        type="password"
        autocomplete="new-password"
        required
        minlength="8"
        :placeholder="t('auth.passwordPlaceholder')"
      />
    </div>

    <div
      role="alert"
      class="flex flex-col gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"
    >
      <p class="font-medium">{{ t("auth.noRecoveryWarning") }}</p>
      <label class="flex items-start gap-2 font-normal">
        <input v-model="acknowledged" type="checkbox" required class="mt-0.5 accent-destructive" />
        <span>{{ t("auth.acknowledgeWarning") }}</span>
      </label>
    </div>

    <p v-if="errorMessage" class="text-xs text-destructive">{{ errorMessage }}</p>

    <Button type="submit" :disabled="!acknowledged || isSubmitting">
      {{ isSubmitting ? t("auth.registering") : t("auth.register") }}
    </Button>

    <button
      type="button"
      class="text-xs text-muted-foreground underline-offset-4 hover:underline"
      @click="emit('switch-to-login')"
    >
      {{ t("auth.haveAccount") }} {{ t("auth.logIn") }}
    </button>
  </form>
</template>
