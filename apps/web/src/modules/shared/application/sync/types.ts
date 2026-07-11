/** The four synced aggregates. Kept here to avoid an import cycle between the
 * meta store and the aggregate descriptors. */
export type AggregateKey = "learn" | "drills" | "earTraining" | "preferences";

export const AGGREGATE_KEYS: AggregateKey[] = ["learn", "drills", "earTraining", "preferences"];
