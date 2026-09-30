import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { createApiRouter } from "./routes/index.js";
import { createHealthService, type HealthService } from "./services/health.service.js";

/** Services the routes depend on — injectable so tests can swap in fakes. */
export type AppDeps = {
  health: HealthService;
};

const defaultDeps = (): AppDeps => ({
  health: createHealthService(prisma),
});

/**
 * Builds the Express app without listening (server.ts listens; Supertest uses the app directly).
 * Middleware order matters: logging → security headers → CORS → body parsing → routes → 404 → errors.
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
      // Health probes run every few seconds on Render — don't flood the logs with them.
      autoLogging: { ignore: (req) => req.url?.startsWith("/api/health") ?? false },
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

  app.use("/api", createApiRouter(deps));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
