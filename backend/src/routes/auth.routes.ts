import { Router } from "express";
import type { RateLimitRules } from "../config/rateLimits.js";
import { createAuthController } from "../controllers/auth.controller.js";
import { createGoogleController } from "../controllers/google.controller.js";
import type { GoogleClient } from "../lib/google.js";
import type { Mailer } from "../lib/mailer.js";
import { blockCrossSiteWrites } from "../middleware/blockCrossSiteWrites.js";
import { loadSession } from "../middleware/loadSession.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { validateBody } from "../middleware/validateBody.js";
import { loginSchema, registerSchema, resendVerificationSchema, verifyEmailSchema } from "../schemas/auth.schema.js";
import type { AuthService } from "../services/auth.service.js";
import type { RateLimitStore } from "../services/rateLimit.store.js";

type AuthRouterDeps = {
  auth: AuthService;
  rateLimitStore: RateLimitStore;
  rateLimits: RateLimitRules;
  allowedOrigins: readonly string[];
  google: GoogleClient;
  mailer: Mailer;
};

/**
 * POST /register, /login, /verify-email, /resend-verification, /logout · GET /me, /google (+ /google/callback).
 * Order per write: CSRF guard → validation → rate limit → controller.
 */
export function createAuthRouter({ auth, rateLimitStore, rateLimits, allowedOrigins, google, mailer }: AuthRouterDeps) {
  // The first allowed origin is the website itself (env.ts: CORS_ORIGINS).
  const appOrigin = allowedOrigins[0]!;
  const controller = createAuthController({ auth, mailer, appOrigin });
  const googleController = createGoogleController({ auth, google, appOrigin });
  const limits = (rules: RateLimitRules[keyof RateLimitRules]) => rules.map((rule) => rateLimit(rateLimitStore, rule));
  const router = Router();

  router.use(blockCrossSiteWrites(allowedOrigins));

  router.post("/register", validateBody(registerSchema), ...limits(rateLimits.register), controller.register);
  router.post("/login", validateBody(loginSchema), ...limits(rateLimits.login), controller.login);
  router.post("/verify-email", validateBody(verifyEmailSchema), ...limits(rateLimits.verifyEmail), controller.verifyEmail);
  router.post(
    "/resend-verification",
    validateBody(resendVerificationSchema),
    ...limits(rateLimits.resendVerification),
    controller.resendVerification,
  );
  router.post("/logout", controller.logout);
  router.get("/me", loadSession(auth), controller.me);
  // Page navigations (GET), not fetch calls — they answer with redirects, never JSON.
  router.get("/google", googleController.start);
  router.get("/google/callback", googleController.callback);

  return router;
}
