import type {
  LoginInput,
  RegisterInput,
  SyncEnvelope,
  UpdateProfileInput,
  UserProfile,
} from "@music-workspace/shared-types";

const BASE = "/v1";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(BASE + path, {
    ...init,
    // Only advertise a JSON body when one is present — Fastify rejects an empty
    // body sent with `Content-Type: application/json`.
    headers: init?.body ? { "Content-Type": "application/json", ...init?.headers } : init?.headers,
    credentials: "same-origin",
  });

  const body = response.status === 204 ? undefined : await response.json().catch(() => undefined);

  if (!response.ok) {
    throw new ApiError(response.status, `${init?.method ?? "GET"} ${path} → ${response.status}`, body);
  }

  return body as T;
}

/** Result of a snapshot PUT: accepted, or rejected as stale with the server's current envelope. */
export type PutResult<T> =
  | { ok: true; envelope: SyncEnvelope<T> }
  | { ok: false; conflict: SyncEnvelope<T> };

/**
 * Thin typed wrapper over the backend. All calls are cookie-authenticated
 * (same-origin; the Vite proxy makes `/v1` same-origin in dev) and every method
 * can reject with {@link ApiError} — callers degrade gracefully when offline.
 */
export const apiClient = {
  getMe: () => request<UserProfile>("/me"),

  createAnonymous: () => request<UserProfile>("/auth/anonymous", { method: "POST" }),

  /** Upgrades the current anonymous account in place — same `user.id`, progress preserved. */
  register: (input: RegisterInput) =>
    request<UserProfile>("/auth/register", { method: "POST", body: JSON.stringify(input) }),

  /** Verifies credentials and issues a fresh session for the existing account. */
  login: (input: LoginInput) =>
    request<UserProfile>("/auth/login", { method: "POST", body: JSON.stringify(input) }),

  logout: () => request<void>("/auth/logout", { method: "POST" }),

  updateMe: (input: UpdateProfileInput) =>
    request<UserProfile>("/me", { method: "PATCH", body: JSON.stringify(input) }),

  getSnapshot: <T>(slug: string) => request<SyncEnvelope<T | null>>(`/sync/${slug}`),

  async putSnapshot<T>(slug: string, envelope: SyncEnvelope<T>): Promise<PutResult<T>> {
    try {
      const stored = await request<SyncEnvelope<T>>(`/sync/${slug}`, {
        method: "PUT",
        body: JSON.stringify(envelope),
      });
      return { ok: true, envelope: stored };
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        return { ok: false, conflict: error.body as SyncEnvelope<T> };
      }
      throw error;
    }
  },
};
