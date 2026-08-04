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

describe("register", () => {
  it("upgrades the anonymous account in place", async () => {
    const { token, body } = await signInAnonymously();

    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      cookies: { [SESSION_COOKIE]: token },
      payload: { email: "ada@example.com", password: "correct-horse" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().id).toBe(body.id);
    expect(response.json().email).toBe("ada@example.com");
    expect(response.json().passwordHash).toBeUndefined();

    const me = await app.inject({
      method: "GET",
      url: "/v1/me",
      cookies: { [SESSION_COOKIE]: token },
    });

    expect(me.json().email).toBe("ada@example.com");
  });

  it("rejects an email already claimed by another account with 409", async () => {
    const first = await signInAnonymously();
    await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      cookies: { [SESSION_COOKIE]: first.token },
      payload: { email: "taken@example.com", password: "correct-horse" },
    });

    const second = await signInAnonymously();
    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      cookies: { [SESSION_COOKIE]: second.token },
      payload: { email: "taken@example.com", password: "another-pass" },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().error).toBe("email-taken");
  });

  it("rejects a second registration on an already-registered account with 409", async () => {
    const { token } = await signInAnonymously();
    await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      cookies: { [SESSION_COOKIE]: token },
      payload: { email: "once@example.com", password: "correct-horse" },
    });

    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      cookies: { [SESSION_COOKIE]: token },
      payload: { email: "twice@example.com", password: "correct-horse" },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().error).toBe("already-registered");
  });
});

describe("login", () => {
  it("sets a working session on correct credentials", async () => {
    const { token: anonToken } = await signInAnonymously();
    await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      cookies: { [SESSION_COOKIE]: anonToken },
      payload: { email: "login-ok@example.com", password: "correct-horse" },
    });

    const login = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: { email: "login-ok@example.com", password: "correct-horse" },
    });

    expect(login.statusCode).toBe(200);
    const loginCookie = login.cookies.find((c) => c.name === SESSION_COOKIE);
    expect(loginCookie).toBeDefined();

    const me = await app.inject({
      method: "GET",
      url: "/v1/me",
      cookies: { [SESSION_COOKIE]: loginCookie!.value },
    });

    expect(me.statusCode).toBe(200);
    expect(me.json().email).toBe("login-ok@example.com");
  });

  it("rejects an incorrect password with 401", async () => {
    const { token: anonToken } = await signInAnonymously();
    await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      cookies: { [SESSION_COOKIE]: anonToken },
      payload: { email: "wrong-pass@example.com", password: "correct-horse" },
    });

    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: { email: "wrong-pass@example.com", password: "incorrect-horse" },
    });

    expect(response.statusCode).toBe(401);
  });

  it("rejects an unknown email with 401", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: { email: "nobody@example.com", password: "correct-horse" },
    });

    expect(response.statusCode).toBe(401);
  });
});

describe("logout", () => {
  it("clears the session so subsequent requests are unauthorized", async () => {
    const { token } = await signInAnonymously();

    const logout = await app.inject({
      method: "POST",
      url: "/v1/auth/logout",
      cookies: { [SESSION_COOKIE]: token },
    });

    expect(logout.statusCode).toBe(204);

    const me = await app.inject({
      method: "GET",
      url: "/v1/me",
      cookies: { [SESSION_COOKIE]: token },
    });

    expect(me.statusCode).toBe(401);
  });
});
