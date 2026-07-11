# api

Backend for the Scale Explorer workspace. See the implementation plan at
[`.agents/plans/BACKEND_IMPLEMENTATION_PLAN.md`](../../.agents/plans/BACKEND_IMPLEMENTATION_PLAN.md).

The app is **local-first**: this API is a per-user sync layer for progress and preferences,
not a replacement for the client's `localStorage`. No music-theory logic lives here — the
`@music-workspace/music-theory` domain package stays on the client.

## Stack

- **Fastify 5** + TypeScript (ESM), run directly with `tsx` (no build step, matching the rest of the monorepo).
- **Drizzle ORM** over **better-sqlite3** (SQLite in dev; schema kept to the Postgres-common subset).
- **@fastify/cookie** for httpOnly session cookies; **zod** contracts from `@music-workspace/shared-types`.
- Feature-based layout under `src/modules/<feature>/{routes,service,...}.ts`.
- `buildApp()` in `src/app.ts` creates the instance without binding a port so tests drive it via
  `app.inject()`; `src/server.ts` is the only place that listens.

## Scripts

| Command | What it does |
|---|---|
| `pnpm --filter api dev` | Watch-mode server on `http://localhost:3001` |
| `pnpm --filter api start` | Run the server once |
| `pnpm --filter api build` | Type-check (`tsc --noEmit`) |
| `pnpm --filter api test` | Run Vitest |
| `pnpm --filter api db:generate` | Generate a migration from `src/db/schema.ts` into `drizzle/` |

Env: `PORT` (default `3001`), `HOST` (default `0.0.0.0`), `DATABASE_URL` (default `data/app.db`;
use `:memory:` for tests), `NODE_ENV` (`production` makes the session cookie `secure` and emits JSON
logs; dev uses pretty logs), `LOG_LEVEL` (default `info`), `RATE_LIMIT_MAX` (default `200`) and
`RATE_LIMIT_WINDOW` (default `1 minute`) for the per-IP rate limit.

## Routes

- `GET /v1/health` — liveness snapshot (`{ status, uptime }`).
- `POST /v1/auth/anonymous` — creates an anonymous account, sets the httpOnly session cookie,
  returns the profile.
- `GET /v1/me` — the signed-in profile (401 without a valid session).
- `PATCH /v1/me` — update the display name (`{ name }`, validated by shared-types).
- `GET /v1/sync/<aggregate>` — the stored `{ data, updatedAt }` envelope, or `{ data: null,
  updatedAt: 0 }` if nothing is stored yet.
- `PUT /v1/sync/<aggregate>` — store a snapshot (validated against its shared-types contract).
  Applies last-write-wins: a write older than what's stored gets `409` plus the current server
  envelope so the client can reconcile.

`<aggregate>` is one of `learn`, `drills`, `ear-training`, `preferences`.

Migrations run automatically on boot (`createDb`).
