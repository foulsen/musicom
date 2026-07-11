import type { FastifyReply, FastifyRequest } from "fastify";

import { resolveSession } from "./service";
import { SESSION_COOKIE } from "./session";

/**
 * preHandler that gates a route behind a valid session cookie. On success it
 * attaches the resolved profile to `request.user`; otherwise replies 401 and
 * halts the handler chain.
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const rawToken = request.cookies[SESSION_COOKIE];

  if (!rawToken) {
    await reply.code(401).send({ error: "Unauthorized", message: "Missing session" });
    return;
  }

  const user = await resolveSession(request.server.db, rawToken);

  if (!user) {
    await reply.code(401).send({ error: "Unauthorized", message: "Invalid session" });
    return;
  }

  request.user = user;
}
