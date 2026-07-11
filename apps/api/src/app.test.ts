import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, expect, it } from "vitest";

import { buildApp } from "./app";

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp({ databaseUrl: ":memory:" });
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

it("reports healthy on GET /v1/health", async () => {
  const response = await app.inject({ method: "GET", url: "/v1/health" });

  expect(response.statusCode).toBe(200);

  const body = response.json();
  expect(body.status).toBe("ok");
  expect(typeof body.uptime).toBe("number");
});

it("returns 404 for unknown routes", async () => {
  const response = await app.inject({ method: "GET", url: "/v1/nope" });

  expect(response.statusCode).toBe(404);
});

it("applies rate limiting (exposes x-ratelimit headers)", async () => {
  const response = await app.inject({ method: "GET", url: "/v1/health" });

  expect(response.headers["x-ratelimit-limit"]).toBeDefined();
  expect(response.headers["x-ratelimit-remaining"]).toBeDefined();
});
