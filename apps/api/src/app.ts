import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import Fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";

import { config } from "./config";
import { createDb } from "./db/client";
import { authRoutes } from "./modules/auth/routes";
import { healthRoutes } from "./modules/health/routes";
import { profileRoutes } from "./modules/profile/routes";
import { syncRoutes } from "./modules/sync/routes";

export interface BuildAppOptions {
  logger?: FastifyServerOptions["logger"];
  /** Overrides the configured libSQL URL — tests pass ":memory:". */
  databaseUrl?: string;
  /** Overrides the configured Turso auth token. */
  databaseAuthToken?: string;
}

/**
 * Builds the Fastify instance without binding a port, so tests can drive it
 * via `app.inject()`. Actual listening happens in `server.ts`.
 * Feature routes register under the versioned `/v1` prefix.
 */
export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.logger ?? false,
  });

  const { db, close } = await createDb(
    options.databaseUrl ?? config.databaseUrl,
    options.databaseAuthToken ?? config.databaseAuthToken,
  );
  app.decorate("db", db);
  app.addHook("onClose", () => close());

  app.register(cookie);
  app.register(rateLimit, { max: config.rateLimit.max, timeWindow: config.rateLimit.timeWindow });

  app.register(healthRoutes, { prefix: "/v1" });
  app.register(authRoutes, { prefix: "/v1" });
  app.register(profileRoutes, { prefix: "/v1" });
  app.register(syncRoutes, { prefix: "/v1" });

  return app;
}
