import { Router } from "express";
import { createHealthController } from "../controllers/health.controller.js";
import type { HealthService } from "../services/health.service.js";

export function createHealthRouter(health: HealthService) {
  const controller = createHealthController(health);
  const router = Router();

  router.get("/", controller.liveness);
  router.get("/ready", controller.readiness);

  return router;
}
