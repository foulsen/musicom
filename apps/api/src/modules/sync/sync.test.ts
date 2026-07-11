import type { LearnSnapshot } from "@music-workspace/shared-types";
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "../../app";
import { SESSION_COOKIE } from "../auth/session";

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp({ databaseUrl: ":memory:" });
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

async function signIn(): Promise<string> {
  const response = await app.inject({ method: "POST", url: "/v1/auth/anonymous" });

  return response.cookies.find((c) => c.name === SESSION_COOKIE)!.value;
}

const learnData: LearnSnapshot = {
  progress: { "lesson-1": { completedStepIndexes: [0, 1], checkpoint: { correct: 3, total: 4 } } },
  lastVisitedLessonId: "lesson-1",
};

describe("sync auth gating", () => {
  it("rejects GET without a session", async () => {
    const response = await app.inject({ method: "GET", url: "/v1/sync/learn" });
    expect(response.statusCode).toBe(401);
  });

  it("rejects PUT without a session", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/v1/sync/learn",
      payload: { data: learnData, updatedAt: 1 },
    });
    expect(response.statusCode).toBe(401);
  });
});

describe("sync round-trip", () => {
  it("returns an empty sentinel before anything is stored", async () => {
    const token = await signIn();

    const response = await app.inject({
      method: "GET",
      url: "/v1/sync/learn",
      cookies: { [SESSION_COOKIE]: token },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ data: null, updatedAt: 0 });
  });

  it("stores then reads back a snapshot", async () => {
    const token = await signIn();
    const envelope = { data: learnData, updatedAt: 1_000 };

    const put = await app.inject({
      method: "PUT",
      url: "/v1/sync/learn",
      cookies: { [SESSION_COOKIE]: token },
      payload: envelope,
    });
    expect(put.statusCode).toBe(200);
    expect(put.json()).toEqual(envelope);

    const get = await app.inject({
      method: "GET",
      url: "/v1/sync/learn",
      cookies: { [SESSION_COOKIE]: token },
    });
    expect(get.json()).toEqual(envelope);
  });
});

describe("last-write-wins", () => {
  it("accepts a newer write and rejects a stale one with 409 + current state", async () => {
    const token = await signIn();

    await app.inject({
      method: "PUT",
      url: "/v1/sync/preferences",
      cookies: { [SESSION_COOKIE]: token },
      payload: { data: { locale: "en" }, updatedAt: 2_000 },
    });

    const newer = await app.inject({
      method: "PUT",
      url: "/v1/sync/preferences",
      cookies: { [SESSION_COOKIE]: token },
      payload: { data: { locale: "pt" }, updatedAt: 3_000 },
    });
    expect(newer.statusCode).toBe(200);
    expect(newer.json().data.locale).toBe("pt");

    const stale = await app.inject({
      method: "PUT",
      url: "/v1/sync/preferences",
      cookies: { [SESSION_COOKIE]: token },
      payload: { data: { locale: "en" }, updatedAt: 1_500 },
    });
    expect(stale.statusCode).toBe(409);
    // Server returns its current (newer) state so the client can reconcile.
    expect(stale.json()).toEqual({ data: { locale: "pt" }, updatedAt: 3_000 });
  });
});

describe("validation", () => {
  it("rejects a snapshot that violates the contract", async () => {
    const token = await signIn();

    const response = await app.inject({
      method: "PUT",
      url: "/v1/sync/preferences",
      cookies: { [SESSION_COOKIE]: token },
      payload: { data: { audio: { masterVolume: 5 } }, updatedAt: 1 },
    });

    expect(response.statusCode).toBe(400);
  });

  it("rejects a body missing updatedAt", async () => {
    const token = await signIn();

    const response = await app.inject({
      method: "PUT",
      url: "/v1/sync/learn",
      cookies: { [SESSION_COOKIE]: token },
      payload: { data: learnData },
    });

    expect(response.statusCode).toBe(400);
  });
});

describe("isolation", () => {
  it("keeps snapshots separate per account", async () => {
    const first = await signIn();
    const second = await signIn();

    await app.inject({
      method: "PUT",
      url: "/v1/sync/drills",
      cookies: { [SESSION_COOKIE]: first },
      payload: {
        data: {
          cardStates: {},
          fretboardBestMsByNote: { C: 900 },
          noteIdScore: { correct: 1, total: 1 },
          noteIdStreak: 1,
          noteIdBestStreak: 1,
        },
        updatedAt: 10,
      },
    });

    const secondGet = await app.inject({
      method: "GET",
      url: "/v1/sync/drills",
      cookies: { [SESSION_COOKIE]: second },
    });

    expect(secondGet.json()).toEqual({ data: null, updatedAt: 0 });
  });
});
