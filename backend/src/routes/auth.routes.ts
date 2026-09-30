import { Router } from "express";
import type { RateLimitRules } from "../config/rateLimits.js";
import { createAuthController } from "../controllers/auth.controller.js";
import { blockCrossSiteWrites } from "../middleware/blockCrossSiteWrites.js";
import { loadSession } from "../middleware/loadSession.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { validateBody } from "../middleware/validateBody.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import type { AuthService } from "../services/auth.service.js";
import type { RateLimitStore } from "../services/rateLimit.store.js";

type AuthRouterDeps = {
  auth: AuthService;
  rateLimitStore: RateLimitStore;
  rateLimits: RateLimitRules;
  allowedOrigins: readonly string[];
};

/**
 * POST /register, POST /login, POST /logout, GET /me.
 * Order per write: CSRF guard → validation → rate limit → controller.
 */
export function createAuthRouter({ auth, rateLimitStore, rateLimits, allowedOrigins }: AuthRouterDeps) {
  const controller = createAuthController(auth);
  const limits = (rules: RateLimitRules[keyof RateLimitRules]) => rules.map((rule) => rateLimit(rateLimitStore, rule));
  const router = Router();

  router.use(blockCrossSiteWrites(allowedOrigins));

  router.post("/register", validateBody(registerSchema), ...limits(rateLimits.register), controller.register);
  router.post("/login", validateBody(loginSchema), ...limits(rateLimits.login), controller.login);
  router.post("/logout", controller.logout);
  router.get("/me", loadSession(auth), controller.me);

  return router;
}
