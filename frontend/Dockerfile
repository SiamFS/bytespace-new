# syntax=docker/dockerfile:1

# Next.js production image (standalone output — Next.js docs "output" + "Deploying → Docker").
# Used by docker-compose.yml for local runs; production runs on Vercel, not this image.
FROM node:22-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---- deps: install once, cached until the lockfile changes ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- build ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# The /api rewrite target is read at build time (next.config.ts). Inside Compose the API is the
# `backend` service; the browser still only talks to this container (same origin, first-party cookies).
ARG API_URL=http://backend:4000
ENV API_URL=$API_URL DOCKER_BUILD=1
# `npm run build` also downloads the Satoshi font (licence: never committed to the repo).
RUN npm run build

# ---- runtime: only the traced server files, non-root ----
FROM base AS runtime
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
