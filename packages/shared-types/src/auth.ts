import { z } from "zod";

/**
 * Body accepted by `POST /v1/auth/register`. Upgrades the caller's current
 * anonymous account in place (same `user.id`, progress preserved) by setting
 * `email` + a derived password hash — no merge logic involved.
 */
export const registerInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});
export type RegisterInput = z.infer<typeof registerInputSchema>;

/**
 * Body accepted by `POST /v1/auth/login`. Verifies credentials against an
 * existing claimed account and issues a fresh session for the caller.
 */
export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});
export type LoginInput = z.infer<typeof loginInputSchema>;
