import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "../../app";
import { SESSION_COOKIE } from "./session";

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp({ databaseUrl: ":memory:" });
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

async function signInAnonymously(): Promise<{ token: string; body: Record<string, unknown> }> {
  const response = await app.inject({ method: "POST", url: "/v1/auth/anonymous" });

  expect(response.statusCode).toBe(201);

  const cookie = response.cookies.find((c) => c.name === SESSION_COOKIE);
  expect(cookie).toBeDefined();
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.sameSite?.toLowerCase()).toBe("lax");

  return { token: cookie!.value, body: response.json() };
}

describe("anonymous auth", () => {
  it("creates an anonymous account and sets an httpOnly session cookie", async () => {
    const { body } = await signInAnonymously();

    expect(body.name).toBe("");
    expect(body.email).toBeNull();
    expect(typeof body.id).toBe("string");
  });

  it("rejects /v1/me without a session", async () => {
    const response = await app.inject({ method: "GET", url: "/v1/me" });

    expect(response.statusCode).toBe(401);
  });

  it("rejects /v1/me with an invalid session cookie", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/v1/me",
      cookies: { [SESSION_COOKIE]: "not-a-real-token" },
    });

    expect(response.statusCode).toBe(401);
  });
});

describe("profile", () => {
  it("returns the signed-in profile from /v1/me", async () => {
    const { token, body } = await signInAnonymously();

    const response = await app.inject({
      method: "GET",
      url: "/v1/me",
      cookies: { [SESSION_COOKIE]: token },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(body);
  });

  it("updates the display name via PATCH /v1/me", async () => {
    const { token } = await signInAnonymously();

    const patch = await app.inject({
      method: "PATCH",
      url: "/v1/me",
      cookies: { [SESSION_COOKIE]: token },
      payload: { name: "  Ada Lovelace  " },
    });

    expect(patch.statusCode).toBe(200);
    expect(patch.json().name).toBe("Ada Lovelace");

    const me = await app.inject({
      method: "GET",
      url: "/v1/me",
      cookies: { [SESSION_COOKIE]: token },
    });
    expect(me.json().name).toBe("Ada Lovelace");
  });

  it("rejects a blank name with 400", async () => {
    const { token } = await signInAnonymously();

    const response = await app.inject({
      method: "PATCH",
      url: "/v1/me",
      cookies: { [SESSION_COOKIE]: token },
      payload: { name: "   " },
    });

    expect(response.statusCode).toBe(400);
  });

  it("keeps sessions isolated between accounts", async () => {
    const first = await signInAnonymously();
    const second = await signInAnonymously();

    await app.inject({
      method: "PATCH",
      url: "/v1/me",
      cookies: { [SESSION_COOKIE]: first.token },
      payload: { name: "First" },
    });

    const secondMe = await app.inject({
      method: "GET",
      url: "/v1/me",
      cookies: { [SESSION_COOKIE]: second.token },
    });

    expect(secondMe.json().name).toBe("");
  });
});
