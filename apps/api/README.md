# api

Backend for the Scale Explorer workspace. See the implementation plan at
[`.agents/plans/BACKEND_IMPLEMENTATION_PLAN.md`](../../.agents/plans/BACKEND_IMPLEMENTATION_PLAN.md).

The app is **local-first**: this API is a per-user sync layer for progress and preferences,
not a replacement for the client's `localStorage`. No music-theory logic lives here — the
`@music-workspace/music-theory` domain package stays on the client.

## Stack

- **Fastify 5** + TypeScript (ESM), run directly with `tsx` (no build step, matching the rest of the monorepo).
- Feature-based layout under `src/modules/<feature>/{routes,service,schema}.ts`.
- `buildApp()` in `src/app.ts` creates the instance without binding a port so tests drive it via
  `app.inject()`; `src/server.ts` is the only place that listens.

## Scripts

| Command | What it does |
|---|---|
| `pnpm --filter api dev` | Watch-mode server on `http://localhost:3001` |
| `pnpm --filter api start` | Run the server once |
| `pnpm --filter api build` | Type-check (`tsc --noEmit`) |
| `pnpm --filter api test` | Run Vitest |

Env: `PORT` (default `3001`), `HOST` (default `0.0.0.0`).

## Routes (phase 0)

- `GET /v1/health` — liveness snapshot (`{ status, uptime }`).

Auth, persistence (Drizzle/SQLite), and the `/v1/sync/*` endpoints arrive in later phases.
