# Deploying to Vercel

One Vercel project serves both the SPA and the API, so the session cookie
stays same-origin (no CORS).

## 1. Architecture

- **Static SPA** — `apps/web` builds to `apps/web/dist` and is served as
  Vercel's static output.
- **API as a serverless function** — `api/index.ts` wraps
  `buildApp({ logger: false, migrate: false })` from `apps/api/src/app.ts`
  and forwards the raw Node request/response to Fastify. The Fastify
  instance is built once per cold start and reused across warm invocations.
- **Same-origin routing** — `vercel.json` rewrites `/v1/(.*)` to `/api`, and
  everything else falls back to `/index.html` (SPA routing). Because the API
  is reached at `/v1/...` on the same origin as the web app, the httpOnly
  `SameSite=Lax` session cookie flows without any CORS configuration.
- **Migrations do not run on the request path.** `buildApp` is called with
  `migrate: false` in `api/index.ts`, unlike local dev (`server.ts`), which
  runs migrations at startup. In production, schema changes are applied
  out-of-band (see [Database](#4-database) below) — never on a cold start or
  a request.

## 2. Vercel project settings

- **Root directory**: repo root (monorepo root, not `apps/web`).
- **Build / Install / Output**: read from `vercel.json` — do not override
  them in the dashboard:
  - `installCommand`: `pnpm install --frozen-lockfile`
  - `buildCommand`: `pnpm --filter web build`
  - `outputDirectory`: `apps/web/dist`
- **Node version**: pinned via the repo-root `.node-version` file (`22`).

## 3. Environment variables (Production)

Required:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | A Turso `libsql://...` URL |
| `TURSO_AUTH_TOKEN` | Auth token for that Turso database |
| `NODE_ENV` | `production` |

Optional (defaults from `apps/api/src/config.ts`, only set if you need to
override):

| Variable | Default |
| --- | --- |
| `LOG_LEVEL` | `info` |
| `RATE_LIMIT_MAX` | `200` (requests) |
| `RATE_LIMIT_WINDOW` | `1 minute` |

`PORT` / `HOST` are not relevant on Vercel — they only matter to the local
`app.listen` in `apps/api/src/server.ts`.

## 4. Database

Use **Turso**: `apps/api` already uses the `@libsql/client` driver, so
pointing `DATABASE_URL` at a `libsql://` Turso database is a zero-code-change
swap from the local `file:` database. The free tier comfortably covers a
handful (≤5) of users.

One-time setup before the first deploy (and any time the schema changes):

1. Create the Turso database and grab its `libsql://` URL and auth token.
2. Apply the schema:

   ```sh
   pnpm --filter api db:migrate
   ```

   Run this locally or in CI with the **production** `DATABASE_URL` and
   `TURSO_AUTH_TOKEN` exported in the shell. This is the same
   `drizzle-kit`-generated migration set used in dev, applied explicitly —
   it is intentionally never run automatically at runtime in the deployed
   function.

## 5. Deploy steps

1. Connect the GitHub repo to a new Vercel project.
2. Set the Production environment variables from [section 3](#3-environment-variables-production).
3. Deploy (push to `main`, or trigger a deploy from the dashboard).
4. Whenever the schema changes: run `pnpm --filter api db:generate` to
   create the migration, commit it, then re-run
   `pnpm --filter api db:migrate` against production (step 2 above) before
   or alongside the deploy that depends on it.

## 6. Local development

Nothing changes locally. `pnpm dev` still runs the Fastify server
(`apps/api`, via `server.ts`, which listens and migrates on startup) plus
the Vite dev server for `apps/web`, with Vite proxying `/v1` to the Fastify
server.
