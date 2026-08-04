import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

const SALT_BYTES = 16;
const KEY_LENGTH = 64;

/** Derives a `salt:hash` string (both hex) for storage. Non-blocking (promisified scrypt). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;

  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

/** Verifies a password against a stored `salt:hash` string. Returns false on any malformed input. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");

  if (parts.length !== 2) {
    return false;
  }

  const [saltHex, hashHex] = parts;

  if (!saltHex || !hashHex) {
    return false;
  }

  try {
    const salt = Buffer.from(saltHex, "hex");
    const storedHash = Buffer.from(hashHex, "hex");
    const derivedKey = (await scrypt(password, salt, storedHash.length)) as Buffer;

    if (derivedKey.length !== storedHash.length) {
      return false;
    }

    return timingSafeEqual(derivedKey, storedHash);
  } catch {
    return false;
  }
}
