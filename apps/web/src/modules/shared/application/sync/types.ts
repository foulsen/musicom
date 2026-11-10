/** The five synced aggregates. Kept here to avoid an import cycle between the
 * meta store and the aggregate descriptors. */
export type AggregateKey = "learn" | "drills" | "earTraining" | "preferences" | "reading";

export const AGGREGATE_KEYS: AggregateKey[] = ["learn", "drills", "earTraining", "preferences", "reading"];

/**
 * Background sync state, surfaced in the UI.
 * - `idle`: everything is up to date with the server.
 * - `syncing`: a hydrate or push is in flight.
 * - `offline`: no session/network; edits are saved locally and will retry.
 * - `error`: a push failed; will retry on reconnect.
 */
export type SyncStatus = "idle" | "syncing" | "offline" | "error";
