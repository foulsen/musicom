/** Central runtime config, sourced from env with dev-friendly defaults. */
export const config = {
  port: Number(process.env.PORT ?? 3001),
  host: process.env.HOST ?? "0.0.0.0",
  /** libSQL URL: a local "file:" path in dev, a "libsql://" Turso URL in prod, or ":memory:" for tests. */
  databaseUrl: process.env.DATABASE_URL ?? new URL("../data/app.db", import.meta.url).href,
  /** Only needed for a remote "libsql://" URL — ignored for local "file:" databases. */
  databaseAuthToken: process.env.TURSO_AUTH_TOKEN,
  isProduction: process.env.NODE_ENV === "production",
  logLevel: process.env.LOG_LEVEL ?? "info",
  /** Basic per-IP rate limit. Generous enough for the sync layer's boot burst. */
  rateLimit: {
    max: Number(process.env.RATE_LIMIT_MAX ?? 200),
    timeWindow: process.env.RATE_LIMIT_WINDOW ?? "1 minute",
  },
};
