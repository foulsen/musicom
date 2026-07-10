import { z } from "zod";

/**
 * The authoritative user profile returned by `GET /v1/me`. Today the client
 * only tracks `name` locally (`use-user-store`); the server adds identity.
 * `email` is nullable so an anonymous account can later link an address
 * without a schema migration (plan §2).
 */
export const userProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(80),
  email: z.string().email().nullable(),
});
export type UserProfile = z.infer<typeof userProfileSchema>;

/** Body accepted by `PATCH /v1/me`. */
export const updateProfileInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
});
export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;
