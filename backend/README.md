# ByteSpace API

REST API for ByteSpace — Express 5 + TypeScript, PostgreSQL via Prisma 7, Redis for rate limits, running in Docker.

## Run locally

Requirements: Node 22, Docker.

```bash
# from the repo root: start PostgreSQL (host port 5433) and Redis (6380)
docker compose up -d postgres redis

cd backend
cp .env.example .env # then set JWT_SECRET (openssl rand -base64 32)
npm install          # also generates the Prisma client
npm run db:deploy    # apply migrations
npm run dev          # http://localhost:4000/api/health
```

Run the production image instead (Postgres + Redis + API): `docker compose up --build` from the repo root.
The frontend (`npm run dev` in `frontend/`) proxies `/api/*` here, so the whole app runs at http://localhost:3000.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start with reload (tsx), reads `.env` |
| `npm run build` / `npm start` | Compile to `dist/` / run the compiled server |
| `npm test` | Unit + API tests (Vitest + Supertest) against the `bytespace_test` database; Redis store tests run when `REDIS_URL` is set |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run db:migrate` | Create a migration after changing `prisma/schema.prisma` |
| `npm run db:deploy` | Apply pending migrations (also runs on container start) |

## Endpoints

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/api/health` | — | `200 { status: "ok" }` — liveness, no database call |
| GET | `/api/health/ready` | — | `200` with `checks.database`, or `503` when the database is down |
| POST | `/api/auth/register` | `{ name, email, password }` | `201 { user }` + session cookie · `400` fields · `409` email taken · `429` |
| POST | `/api/auth/login` | `{ email, password }` | `200 { user }` + session cookie · `401` · `429` with `Retry-After` |
| POST | `/api/auth/logout` | `{}` | `204`, cookie cleared (idempotent) |
| GET | `/api/auth/me` | — | `200 { user }`, or `200 { user: null }` when signed out |
| GET | `/api/auth/google` | — | `302` to Google (page navigation, not fetch) · `302 /login?error=google_unavailable` when not configured |
| GET | `/api/auth/google/callback` | `?code&state` from Google | `302 /` + session cookie · `302 /login?error=google_cancelled \| google_failed \| google_conflict` |

`user` is `{ id, name, email, createdAt }` — never the password hash. Every `/api` response is `Cache-Control: no-store`.

Every error uses one shape: `{ "error": { "code": "NOT_FOUND", "message": "…", "fields"?: { … } } }`.

## Security

- **Passwords:** bcrypt (`bcryptjs`, cost `BCRYPT_ROUNDS`), 8–72 bytes. Unknown emails still run a bcrypt compare,
  and a wrong password or unknown email get the same 401, so accounts can't be discovered.
- **Sessions:** HS256 JWT (`jose`, 7 days, issuer and audience checked) in an `HttpOnly; SameSite=Lax; Path=/`
  cookie, `Secure` in production. Each user has a `tokenVersion`; bumping it revokes all their sessions. `/me`
  clears a cookie that no longer works.
- **CSRF:** SameSite=Lax, JSON-only writes, and the `Origin` header (when present) must be in `CORS_ORIGINS`.
- **Rate limits** (Redis, fixed window): login 5/min per IP + email and 20/min per IP; register
  `REGISTER_LIMIT_PER_HOUR` per IP. If Redis is down the request is allowed and the error logged.
- **Google sign-in** (OpenID Connect, authorization code flow — Google's "OpenID Connect" guide): a random `state`
  and `nonce` live in a 10-minute `HttpOnly; SameSite=Lax` cookie; the callback checks `state` (login CSRF), then
  the ID token's signature (Google's JWKS), issuer, audience, expiry and `nonce`. Accounts are matched by Google's
  `sub`, never by email. A Google login is linked to an existing email/password account only when Google says the
  email is verified; otherwise the user is told to sign in with their password. Google-only accounts have no
  password (`passwordHash` is null), so password login for them always fails with the usual 401.
- **Validation** rules match the frontend's: both test suites run `frontend/src/lib/auth/auth-validation-cases.json`.

## Structure

```
src/
├── app.ts          builds the Express app (no listen) — used by server.ts and the tests
├── server.ts       listens, graceful shutdown on SIGTERM/SIGINT
├── config/         environment variables (validated with Zod at startup), rate-limit rules
├── routes/         URL → middleware → controller, one file per resource
├── controllers/    HTTP layer: read the request, call a service, send the response
├── services/       business logic and database access; rate-limit stores
├── middleware/     validation, session loading, rate limits, cross-site guard, 404, errors
├── schemas/        Zod request schemas
├── lib/            Prisma, Redis, logger, AppError, password hashing, session tokens + cookie options
└── generated/      Prisma client (generated, not committed)
test/               API tests (Supertest) + setup that migrates the test database
prisma/             schema.prisma + migrations
```

## Configuration

See `.env.example`. The server refuses to start if a variable is missing or invalid.

- `CORS_ORIGINS` — browser origins allowed to read responses and to send writes. CORS is enforced by browsers
  only; it is not access control. In production the frontend calls the API through its own `/api` rewrite, so
  requests are same-origin.
- `TRUST_PROXY` — number of reverse proxies in front of the API, so `req.ip` is the real client (rate limits key on it).
- `DATABASE_URL` — used by the app (Neon: the pooled `-pooler` host). `DIRECT_URL` — optional, used only by `prisma migrate` (Neon: the direct host; migrations can't run through PgBouncer). Falls back to `DATABASE_URL`.
- `JWT_SECRET` — required, 32+ characters. `REDIS_URL` — optional locally, required on Vercel (`rediss://…` for Upstash). `BCRYPT_ROUNDS` — default 12.
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` — optional (both or neither) for Google sign-in. Google Cloud Console →
  Google Auth Platform → Clients → Web application. The authorized redirect URI is the **first** `CORS_ORIGINS`
  entry + `/api/auth/google/callback` (e.g. `https://<site>/api/auth/google/callback`) — the browser reaches the
  API through the website's `/api` rewrite, so the session cookie stays first-party. Publish the app ("In
  production") so any Google account can sign in; with only `openid email profile` no verification is needed.

## Deploy (Vercel)

The API runs on Vercel as its own project (Root Directory `backend`), separate from the frontend project. Vercel's
Express preset picks up `index.ts`, which default-exports the app; it becomes one Vercel Function (Fluid compute).
`vercel.json` pins the function region to `sin1` (Singapore, next to the Neon and Upstash databases) and runs
`prisma migrate deploy` before the build on production deployments only. `DIRECT_URL` must be set for that step.

- `REDIS_URL` is **required** on Vercel: several function instances can run at once, so in-memory rate limits
  would not be shared between them.
- Docker (`Dockerfile`, `docker-compose.yml`) is for local development and CI; Vercel doesn't use it.
- The frontend project's `API_URL` points at this project's production URL.
