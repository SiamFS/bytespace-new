# ByteSpace API

REST API for ByteSpace — Express 5 + TypeScript, PostgreSQL via Prisma 7, running in Docker.

## Run locally

Requirements: Node 22, Docker.

```bash
# from the repo root: start PostgreSQL (host port 5433)
docker compose up -d db

cd backend
cp .env.example .env
npm install          # also generates the Prisma client
npm run db:deploy    # apply migrations
npm run dev          # http://localhost:4000/api/health
```

Run the production image instead (Postgres + API): `docker compose up --build` from the repo root.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start with reload (tsx), reads `.env` |
| `npm run build` / `npm start` | Compile to `dist/` / run the compiled server |
| `npm test` | Unit + API tests (Vitest + Supertest) against the `bytespace_test` database |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run db:migrate` | Create a migration after changing `prisma/schema.prisma` |
| `npm run db:deploy` | Apply pending migrations (also runs on container start) |

## Endpoints

| Method | Path | Response |
|---|---|---|
| GET | `/api/health` | `200 { status: "ok" }` — liveness, no database call |
| GET | `/api/health/ready` | `200 { status: "ok", checks: { database: "ok" } }` or `503` when the database is down |

Every error uses one shape: `{ "error": { "code": "NOT_FOUND", "message": "…", "fields"?: { … } } }`.

## Structure

```
src/
├── app.ts          builds the Express app (no listen) — used by server.ts and the tests
├── server.ts       listens, graceful shutdown on SIGTERM/SIGINT
├── config/         environment variables, validated with Zod at startup
├── routes/         URL → controller, one file per resource
├── controllers/    HTTP layer: read the request, call a service, send the response
├── services/       business logic and database access
├── middleware/     404 and error handlers (auth, validation, rate limits next)
├── lib/            Prisma client, logger, AppError
└── generated/      Prisma client (generated, not committed)
test/               API tests (Supertest) + setup that migrates the test database
prisma/             schema.prisma + migrations
```

## Configuration

See `.env.example`. The server refuses to start if a variable is missing or invalid.

- `CORS_ORIGINS` — browser origins allowed to read responses. CORS is enforced by browsers only; it
  is not access control. In production the frontend calls the API through its own `/api` rewrite,
  so requests are same-origin.
- `TRUST_PROXY` — number of reverse proxies in front of the API, so `req.ip` is the real client.
