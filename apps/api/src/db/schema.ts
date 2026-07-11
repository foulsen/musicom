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
