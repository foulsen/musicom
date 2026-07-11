import type { UserProfile } from "@music-workspace/shared-types";

import type { Db } from "./db/client";

declare module "fastify" {
  interface FastifyInstance {
    /** Drizzle client, decorated at app build time. */
    db: Db;
  }

  interface FastifyRequest {
    /** Set by the `authenticate` preHandler; present only on gated routes. */
    user?: UserProfile;
  }
}
