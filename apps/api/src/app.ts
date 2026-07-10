import Fastify, { type FastifyInstance } from "fastify";

import { healthRoutes } from "./modules/health/routes";

export interface BuildAppOptions {
  logger?: boolean;
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

  app.register(healthRoutes, { prefix: "/v1" });

  return app;
}
