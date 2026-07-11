import { updateProfileInputSchema } from "@music-workspace/shared-types";
import type { FastifyInstance } from "fastify";

import { authenticate } from "../auth/authenticate";
import { updateName } from "./service";

export async function profileRoutes(app: FastifyInstance): Promise<void> {
  app.get("/me", { preHandler: authenticate }, async (request) => request.user);

  app.patch("/me", { preHandler: authenticate }, async (request, reply) => {
    const parsed = updateProfileInputSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({ error: "BadRequest", issues: parsed.error.issues });
    }

    return await updateName(app.db, request.user!.id, parsed.data.name);
  });
}
