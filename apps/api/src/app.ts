import cookie from "@fastify/cookie";
import Fastify, { type FastifyInstance } from "fastify";

import { config } from "./config";
import { createDb } from "./db/client";
import { authRoutes } from "./modules/auth/routes";
import { healthRoutes } from "./modules/health/routes";
import { profileRoutes } from "./modules/profile/routes";

export interface BuildAppOptions {
  logger?: boolean;
  /** Overrides the configured SQLite path — tests pass ":memory:". */
  databaseUrl?: string;
}

/**
 * Builds the Fastify instance without binding a port, so tests can drive it
 * via `app.inject()`. Actual listening happens in `server.ts`.
 * Feature routes register under the versioned `/v1` prefix.
 */
export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({
    logger: options.logger ?? false,
  });

  const { db, close } = createDb(options.databaseUrl ?? config.databaseUrl);
  app.decorate("db", db);
  app.addHook("onClose", () => close());

  app.register(cookie);

  app.register(healthRoutes, { prefix: "/v1" });
  app.register(authRoutes, { prefix: "/v1" });
  app.register(profileRoutes, { prefix: "/v1" });

  return app;
}
