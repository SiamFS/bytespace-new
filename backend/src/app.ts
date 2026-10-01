import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { defaultRateLimits, type RateLimitRules } from "./config/rateLimits.js";
import { createGoogleClient, type GoogleClient } from "./lib/google.js";
import { logger } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";
import { getRateLimitStore } from "./lib/rateLimitStore.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { createApiRouter } from "./routes/index.js";
import { createAuthService, type AuthService } from "./services/auth.service.js";
import { createHealthService, type HealthService } from "./services/health.service.js";
import type { RateLimitStore } from "./services/rateLimit.store.js";

/** Services the routes depend on — injectable so tests can swap in fakes. */
export type AppDeps = {
  health: HealthService;
  auth: AuthService;
  rateLimitStore: RateLimitStore;
  rateLimits: RateLimitRules;
  google: GoogleClient;
};

const defaultDeps = (): AppDeps => ({
  health: createHealthService(prisma),
  auth: createAuthService(prisma),
  rateLimitStore: getRateLimitStore(),
  rateLimits: defaultRateLimits,
  google: createGoogleClient({ clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }),
});

/**
 * Builds the Express app without listening (server.ts listens; Supertest uses the app directly).
 * Middleware order matters: logging → security headers → CORS → body/cookie parsing → routes → 404 → errors.
 */
export function createApp(overrides: Partial<AppDeps> = {}) {
  const deps: AppDeps = { ...defaultDeps(), ...overrides };
  const app = express();

  // Express docs "Reduce fingerprinting" (helmet also removes it; this covers helmet-less paths).
  app.disable("x-powered-by");
  // Hop count of trusted reverse proxies, so req.ip is the real client (rate limiting needs it).
  app.set("trust proxy", env.TRUST_PROXY);

  app.use(
    pinoHttp({
      logger,
      // Health probes (Docker HEALTHCHECK, uptime monitors) run often — don't flood the logs with them.
      autoLogging: { ignore: (req) => req.url?.startsWith("/api/health") ?? false },
      // With LOG_LEVEL=debug, also log how Express resolved the client address — used once after
      // deploying to set TRUST_PROXY to the real proxy hop count (Vercel).
      customProps: (req) => {
        if (!logger.isLevelEnabled("debug")) return {};
        const { ip, ips } = req as typeof req & { ip?: string; ips?: string[] };
        return { client: { ip, ips, forwardedFor: req.headers["x-forwarded-for"] } };
      },
      // One compact line per request (the default dumps every header).
      serializers: {
        req: (req: { id: unknown; method: string; url: string }) => ({ id: req.id, method: req.method, url: req.url }),
        res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
      },
    }),
  );
  app.use(helmet());
  // CORS only tells *browsers* which origins may read responses; it is not access control
  // (curl/Postman ignore it). The frontend normally calls us through its own /api rewrite
  // (same origin, no CORS needed) — this allow-list covers direct browser calls.
  app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
  app.use(express.json({ limit: "10kb" }));
  app.use(cookieParser());

  // API responses are per-user and must never be cached — Vercel's CDN honours upstream
  // Cache-Control on external rewrites, so a cached /api/auth/me could leak a session.
  app.use("/api", (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  app.use("/api", createApiRouter(deps));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
