import { eq } from "drizzle-orm";

import type { Db } from "../../db/client";
import type { SnapshotTable } from "../../db/schema";

export interface StoredSnapshot {
  data: unknown;
  updatedAt: number;
}

export type WriteResult =
  | { status: "accepted"; data: unknown; updatedAt: number }
  | { status: "stale"; data: unknown; updatedAt: number };

/** Returns the user's stored snapshot for an aggregate, or null if none yet. */
export async function readSnapshot(
  db: Db,
  table: SnapshotTable,
  userId: string,
): Promise<StoredSnapshot | null> {
  const row = await db
    .select({ snapshot: table.snapshot, updatedAt: table.updatedAt })
    .from(table)
    .where(eq(table.userId, userId))
    .get();

  return row ? { data: row.snapshot, updatedAt: row.updatedAt } : null;
}

/**
 * Last-write-wins upsert. A write whose `updatedAt` predates what's stored is
 * rejected as stale and the current server snapshot is returned so the client
 * can reconcile. We trust the client-supplied `updatedAt` (the ordering token
 * across devices) but guard against it going backwards.
 */
export async function writeSnapshot(
  db: Db,
  table: SnapshotTable,
  userId: string,
  data: unknown,
  updatedAt: number,
): Promise<WriteResult> {
  const existing = await readSnapshot(db, table, userId);

  if (existing && updatedAt < existing.updatedAt) {
    return { status: "stale", data: existing.data, updatedAt: existing.updatedAt };
  }

  await db.insert(table)
    .values({ userId, snapshot: data, updatedAt })
    .onConflictDoUpdate({ target: table.userId, set: { snapshot: data, updatedAt } })
    .run();

  return { status: "accepted", data, updatedAt };
}
