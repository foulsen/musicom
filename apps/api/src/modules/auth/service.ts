import { randomUUID } from "node:crypto";

import type { UserProfile } from "@music-workspace/shared-types";
import { eq } from "drizzle-orm";

import type { Db } from "../../db/client";
import { sessions, users } from "../../db/schema";
import { hashPassword, verifyPassword } from "./password";
import { generateSessionToken, hashToken } from "./session";

/** Thrown by `registerUser` when the account/email is not eligible to claim. */
export class RegisterError extends Error {
  constructor(public readonly code: "already-registered" | "email-taken") {
    super(code);
    this.name = "RegisterError";
  }
}

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

/**
 * Claims the CURRENT anonymous account (same `userId`) by attaching an email
 * + password. No merge logic — this is an in-place upgrade.
 */
export async function registerUser(
  db: Db,
  userId: string,
  email: string,
  password: string,
): Promise<UserProfile> {
  const current = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (current?.email) {
    throw new RegisterError("already-registered");
  }

  const emailOwner = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (emailOwner) {
    throw new RegisterError("email-taken");
  }

  const passwordHash = await hashPassword(password);

  await db.update(users).set({ email, passwordHash }).where(eq(users.id, userId)).run();

  return { id: userId, name: current?.name ?? "", email };
}

/** Verifies email + password against a claimed account. Returns null on any mismatch. */
export async function verifyCredentials(db: Db, email: string, password: string): Promise<UserProfile | null> {
  const row = await db
    .select({ id: users.id, name: users.name, email: users.email, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (!row || !row.passwordHash) {
    return null;
  }

  const valid = await verifyPassword(password, row.passwordHash);

  if (!valid) {
    return null;
  }

  return { id: row.id, name: row.name, email: row.email };
}

/** Deletes the session identified by its raw cookie token, if any. */
export async function destroySession(db: Db, rawToken: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(rawToken))).run();
}
