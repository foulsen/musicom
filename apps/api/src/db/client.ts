import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "./schema";

export type Db = BetterSQLite3Database<typeof schema>;

const migrationsFolder = fileURLToPath(new URL("../../drizzle", import.meta.url));

export interface DbHandle {
  db: Db;
  close: () => void;
}

/**
 * Opens a SQLite connection, applies pending migrations, and returns the
 * Drizzle client plus a close handle. Pass ":memory:" for isolated test DBs.
 */
export function createDb(url: string): DbHandle {
  if (url !== ":memory:") {
    mkdirSync(dirname(url), { recursive: true });
  }

  const sqlite = new Database(url);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder });

  return { db, close: () => sqlite.close() };
}
