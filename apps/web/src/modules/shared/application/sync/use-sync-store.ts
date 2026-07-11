import { defineStore } from "pinia";

import { AGGREGATE_KEYS, type AggregateKey } from "./types";

function zeroed(): Record<AggregateKey, number> {
  return Object.fromEntries(AGGREGATE_KEYS.map((key) => [key, 0])) as Record<AggregateKey, number>;
}

/**
 * Persisted sync bookkeeping: the last-known `updatedAt` per aggregate. Survives
 * reloads so last-write-wins still works after the tab is closed and reopened.
 */
export const useSyncStore = defineStore("sync", {
  state: () => ({
    updatedAt: zeroed(),
  }),
  persist: true,
});
