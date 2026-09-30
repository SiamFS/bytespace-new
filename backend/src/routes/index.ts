import { Router } from "express";
import type { AppDeps } from "../app.js";
import { createHealthRouter } from "./health.routes.js";

/** Everything under `/api`. One `router.use` per resource; auth routes join in the next PR. */
export function createApiRouter(deps: AppDeps) {
  const router = Router();

  router.use("/health", createHealthRouter(deps.health));

  return router;
}
