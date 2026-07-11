import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

import * as schema from "./schema";

export type Db = LibSQLDatabase<typeof schema>;

const migrationsFolder = fileURLToPath(new URL("../../drizzle", import.meta.url));

export interface DbHandle {
  db: Db;
  close: () => void;
}

/**
 * Opens a libSQL connection — a local "file:" URL, ":memory:", or a remote
 * "libsql://" Turso URL — applies pending migrations, and returns the
 * Drizzle client plus a close handle.
 */
export async function createDb(url: string, authToken?: string): Promise<DbHandle> {
  if (url.startsWith("file:")) {
    mkdirSync(dirname(fileURLToPath(url)), { recursive: true });
  }

  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder });

  return { db, close: () => client.close() };
}
