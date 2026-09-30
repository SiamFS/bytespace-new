import type { RequestHandler } from "express";
import type { HealthService } from "../services/health.service.js";

/**
 * Two probes, as in the Express "Health checks" guide:
 * - liveness  (`GET /health`)       — the process is up. Used by Render; never touches the DB,
 *   so a slow database doesn't get the service restarted.
 * - readiness (`GET /health/ready`) — the database answers too.
 */
export function createHealthController(health: HealthService) {
  const liveness: RequestHandler = (_req, res) => {
    res.set("Cache-Control", "no-store").json({ status: "ok" });
  };

  const readiness: RequestHandler = async (_req, res) => {
    const databaseUp = await health.isDatabaseUp();
    res
      .set("Cache-Control", "no-store")
      .status(databaseUp ? 200 : 503)
      .json({ status: databaseUp ? "ok" : "unavailable", checks: { database: databaseUp ? "ok" : "down" } });
  };

  return { liveness, readiness };
}
