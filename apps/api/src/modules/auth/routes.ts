import type { FastifyInstance } from "fastify";

import { config } from "../../config";
import { createAnonymousUser, createSession } from "./service";
import { SESSION_COOKIE, sessionCookieOptions } from "./session";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  /** Bootstraps an anonymous account and sets the session cookie. */
  app.post("/auth/anonymous", async (_request, reply) => {
    const user = createAnonymousUser(app.db);
    const rawToken = createSession(app.db, user.id);

    reply.setCookie(SESSION_COOKIE, rawToken, sessionCookieOptions(config.isProduction));

    return reply.code(201).send(user);
  });
}
