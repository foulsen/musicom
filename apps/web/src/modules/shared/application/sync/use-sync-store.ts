import { defineStore } from "pinia";

import { AGGREGATE_KEYS, type AggregateKey, type SyncStatus } from "./types";

function zeroed(): Record<AggregateKey, number> {
  return Object.fromEntries(AGGREGATE_KEYS.map((key) => [key, 0])) as Record<AggregateKey, number>;
}

/**
 * Sync bookkeeping. Only `updatedAt` is persisted — it must survive reloads so
 * last-write-wins still works; `status`/`lastSyncedAt` are transient UI state
 * that should always start fresh.
 */
export const useSyncStore = defineStore("sync", {
  state: () => ({
    updatedAt: zeroed(),
    status: "idle" as SyncStatus,
    lastSyncedAt: null as number | null,
  }),
  persist: { pick: ["updatedAt"] },
});
