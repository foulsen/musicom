import type { FastifyInstance } from "fastify";

import { getHealthStatus } from "./service";

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async () => getHealthStatus());
}
