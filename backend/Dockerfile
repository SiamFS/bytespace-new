# syntax=docker/dockerfile:1

# Debian slim (glibc) — Prisma's v7 Docker guide: node:slim + openssl. Node 22 everywhere (AGENTS.md).
FROM node:22-slim AS base
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ---- build: full install, generate Prisma Client, compile TypeScript ----
FROM base AS build
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma7.config.ts ./
# postinstall runs `prisma generate` (needs the schema, copied above)
RUN npm ci
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

# ---- prod-deps: drop dev dependencies from the build install ----
# Pruning (instead of a fresh `npm ci --omit=dev`) keeps the Prisma engines that were
# downloaded by install scripts during the build — the runtime user can't download them.
FROM build AS prod-deps
RUN npm prune --omit=dev && npm cache clean --force

# ---- runtime: production deps + compiled app, non-root ----
FROM base AS runtime
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
COPY prisma7.config.ts ./

USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||4000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Apply pending migrations, then start. `exec` replaces the shell with node, so node receives
# SIGTERM directly (graceful shutdown in src/server.ts).
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && exec node dist/server.js"]
