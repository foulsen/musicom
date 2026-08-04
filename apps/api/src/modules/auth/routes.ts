import { loginInputSchema, registerInputSchema } from "@music-workspace/shared-types";
import type { FastifyInstance } from "fastify";

import { config } from "../../config";
import { authenticate } from "./authenticate";
import {
  RegisterError,
  createAnonymousUser,
  createSession,
  destroySession,
  registerUser,
  verifyCredentials,
} from "./service";
import { SESSION_COOKIE, sessionCookieOptions } from "./session";

const LOGIN_RATE_LIMIT = { max: 10, timeWindow: "1 minute" };

export async function authRoutes(app: FastifyInstance): Promise<void> {
  /** Bootstraps an anonymous account and sets the session cookie. */
  app.post("/auth/anonymous", async (_request, reply) => {
    const user = await createAnonymousUser(app.db);
    const rawToken = await createSession(app.db, user.id);

    reply.setCookie(SESSION_COOKIE, rawToken, sessionCookieOptions(config.isProduction));

    return reply.code(201).send(user);
  });

  /** Claims the caller's current anonymous account with an email + password. */
  app.post(
    "/auth/register",
    { preHandler: authenticate, config: { rateLimit: LOGIN_RATE_LIMIT } },
    async (request, reply) => {
      const parsed = registerInputSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.code(400).send({ error: "BadRequest", issues: parsed.error.issues });
      }

      try {
        const profile = await registerUser(app.db, request.user!.id, parsed.data.email, parsed.data.password);

        return reply.code(200).send(profile);
      } catch (error) {
        if (error instanceof RegisterError) {
          const message =
            error.code === "already-registered"
              ? "This account is already registered"
              : "This email is already in use";

          return reply.code(409).send({ error: error.code, message });
        }

        throw error;
      }
    },
  );

  /** Verifies credentials and issues a new session (existing account wins, no merge). */
  app.post("/auth/login", { config: { rateLimit: LOGIN_RATE_LIMIT } }, async (request, reply) => {
    const parsed = loginInputSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({ error: "BadRequest", issues: parsed.error.issues });
    }

    const profile = await verifyCredentials(app.db, parsed.data.email, parsed.data.password);

    if (!profile) {
      return reply.code(401).send({ error: "Unauthorized", message: "Invalid credentials" });
    }

    const rawToken = await createSession(app.db, profile.id);
    reply.setCookie(SESSION_COOKIE, rawToken, sessionCookieOptions(config.isProduction));

    return reply.code(200).send(profile);
  });

  /** Destroys the current session, if any, and clears the cookie. */
  app.post("/auth/logout", async (request, reply) => {
    const rawToken = request.cookies[SESSION_COOKIE];

    if (rawToken) {
      await destroySession(app.db, rawToken);
    }

    reply.clearCookie(SESSION_COOKIE, { path: "/" });

    return reply.code(204).send();
  });
}
