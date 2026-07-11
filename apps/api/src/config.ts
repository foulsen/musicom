import { fileURLToPath } from "node:url";

/** Central runtime config, sourced from env with dev-friendly defaults. */
export const config = {
  port: Number(process.env.PORT ?? 3001),
  host: process.env.HOST ?? "0.0.0.0",
  /** SQLite file path, or ":memory:" for tests. */
  databaseUrl: process.env.DATABASE_URL ?? fileURLToPath(new URL("../data/app.db", import.meta.url)),
  isProduction: process.env.NODE_ENV === "production",
};
