import { randomUUID } from "node:crypto";

import type { UserProfile } from "@music-workspace/shared-types";
import { eq } from "drizzle-orm";

import type { Db } from "../../db/client";
import { sessions, users } from "../../db/schema";
import { generateSessionToken, hashToken } from "./session";

/** Creates a fresh anonymous account (empty name, no email). */
export async function createAnonymousUser(db: Db): Promise<UserProfile> {
  const user = { id: randomUUID(), name: "", email: null };

  await db.insert(users).values({ ...user, createdAt: Date.now() }).run();

  return user;
}

/** Issues a session for a user and returns the *raw* token for the cookie. */
export async function createSession(db: Db, userId: string): Promise<string> {
  const raw = generateSessionToken();
  const now = Date.now();

  await db.insert(sessions)
    .values({ tokenHash: hashToken(raw), userId, createdAt: now, lastSeenAt: now })
    .run();

  return raw;
}

/**
 * Resolves a raw cookie token to its owner, bumping `lastSeenAt`. Returns null
 * for unknown/expired tokens.
 */
export async function resolveSession(db: Db, rawToken: string): Promise<UserProfile | null> {
  const tokenHash = hashToken(rawToken);

  const row = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.tokenHash, tokenHash))
    .get();

  if (!row) {
    return null;
  }

  await db.update(sessions).set({ lastSeenAt: Date.now() }).where(eq(sessions.tokenHash, tokenHash)).run();

  return row;
}
