import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * A person's account. Born anonymous (empty name, null email); `email` is
 * nullable + unique so an account can later link an address for multi-device
 * login without a migration (plan §2). Timestamps are epoch milliseconds.
 */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default(""),
  email: text("email").unique(),
  createdAt: integer("created_at").notNull(),
});

/**
 * An authenticated session. We store only the SHA-256 *hash* of the token; the
 * raw token lives solely in the client's httpOnly cookie, so a DB leak can't
 * resurrect sessions.
 */
export const sessions = sqliteTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at").notNull(),
  lastSeenAt: integer("last_seen_at").notNull(),
});

/**
 * One synced aggregate per user, stored as an opaque JSON snapshot plus an
 * `updatedAt` (epoch ms) that drives last-write-wins. The shape of `snapshot`
 * is guarded by the matching zod contract at the route boundary, not by the
 * DB — the server treats it as a blob (plan §2). Not normalized on purpose:
 * per-item tables only earn their keep once a query needs them (plan §1).
 */
function snapshotTable(name: string) {
  return sqliteTable(name, {
    userId: text("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    snapshot: text("snapshot", { mode: "json" }).notNull(),
    updatedAt: integer("updated_at").notNull(),
  });
}

export type SnapshotTable = ReturnType<typeof snapshotTable>;

export const learnProgress = snapshotTable("learn_progress");
export const drillsState = snapshotTable("drills_state");
export const earTraining = snapshotTable("ear_training");
export const preferences = snapshotTable("preferences");
