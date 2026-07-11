import { createHash, randomBytes } from "node:crypto";

import type { CookieSerializeOptions } from "@fastify/cookie";

export const SESSION_COOKIE = "session";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Opaque, URL-safe session token. Only its hash is persisted (see schema). */
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** httpOnly + SameSite=Lax; `secure` only in production (dev runs over http). */
export function sessionCookieOptions(isProduction: boolean): CookieSerializeOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  };
}
