import type { LoginInput, RegisterInput, UserProfile } from "@music-workspace/shared-types";
import { defineStore } from "pinia";

import { apiClient } from "@/lib/api-client";

/**
 * Current user's identity/auth status. An account is "registered" once it has
 * an email; anonymous accounts (created transparently on boot) have `email: null`.
 * Not persisted — always re-seeded from the server via `setUser` during sync bootstrap.
 */
export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as UserProfile | null,
  }),
  getters: {
    isAuthenticated: (state) => state.user?.email != null,
  },
  actions: {
    /** Seeds the store with a profile resolved elsewhere (e.g. sync bootstrap). */
    setUser(profile: UserProfile): void {
      this.user = profile;
    },

    /** Upgrades the current anonymous account in place. Lets ApiError propagate (e.g. 409 email taken). */
    async register(input: RegisterInput): Promise<UserProfile> {
      const profile = await apiClient.register(input);
      this.user = profile;
      return profile;
    },

    /** Verifies credentials and adopts the returned (existing) account's profile. */
    async login(input: LoginInput): Promise<UserProfile> {
      const profile = await apiClient.login(input);
      this.user = profile;
      return profile;
    },

    async logout(): Promise<void> {
      await apiClient.logout();
      this.user = null;
    },
  },
});
