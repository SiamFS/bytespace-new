import { Router } from "express";
import type { AppDeps } from "../app.js";
import { env } from "../config/env.js";
import { createAuthRouter } from "./auth.routes.js";
import { createHealthRouter } from "./health.routes.js";

/** Everything under `/api`. One `router.use` per resource. */
export function createApiRouter(deps: AppDeps) {
  const router = Router();

  router.use("/health", createHealthRouter(deps.health));
  router.use(
    "/auth",
    createAuthRouter({
      auth: deps.auth,
      rateLimitStore: deps.rateLimitStore,
      rateLimits: deps.rateLimits,
      allowedOrigins: env.CORS_ORIGINS,
      google: deps.google,
    }),
  );

  return router;
}
