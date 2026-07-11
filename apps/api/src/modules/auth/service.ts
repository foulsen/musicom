import { randomUUID } from "node:crypto";

import type { UserProfile } from "@music-workspace/shared-types";
import { eq } from "drizzle-orm";

import type { Db } from "../../db/client";
import { sessions, users } from "../../db/schema";
import { generateSessionToken, hashToken } from "./session";

/** Creates a fresh anonymous account (empty name, no email). */
export function createAnonymousUser(db: Db): UserProfile {
  const user = { id: randomUUID(), name: "", email: null };

  db.insert(users).values({ ...user, createdAt: Date.now() }).run();

  return user;
}

/** Issues a session for a user and returns the *raw* token for the cookie. */
export function createSession(db: Db, userId: string): string {
  const raw = generateSessionToken();
  const now = Date.now();

  db.insert(sessions)
    .values({ tokenHash: hashToken(raw), userId, createdAt: now, lastSeenAt: now })
    .run();

  return raw;
}

/**
 * Resolves a raw cookie token to its owner, bumping `lastSeenAt`. Returns null
 * for unknown/expired tokens.
 */
export function resolveSession(db: Db, rawToken: string): UserProfile | null {
  const tokenHash = hashToken(rawToken);

  const row = db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.tokenHash, tokenHash))
    .get();

  if (!row) {
    return null;
  }

  db.update(sessions).set({ lastSeenAt: Date.now() }).where(eq(sessions.tokenHash, tokenHash)).run();

  return row;
}
