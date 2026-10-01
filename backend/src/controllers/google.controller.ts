import { randomBytes, timingSafeEqual } from "node:crypto";
import type { CookieOptions, RequestHandler } from "express";
import { env } from "../config/env.js";
import { AppError } from "../lib/errors.js";
import type { GoogleClient } from "../lib/google.js";
import { startSession } from "../lib/session.js";
import type { AuthService } from "../services/auth.service.js";

/** Short-lived cookie holding `state.nonce` between the redirect to Google and the callback. */
export const OAUTH_COOKIE = "oauth_google";
const OAUTH_COOKIE_PATH = "/api/auth/google";

const oauthCookie: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  // Lax: the callback is a top-level GET navigation from accounts.google.com, so the cookie is sent.
  sameSite: "lax",
  path: OAUTH_COOKIE_PATH,
  maxAge: 10 * 60 * 1000,
};
// Same attributes minus the expiry (Express 5's clearCookie ignores maxAge anyway).
const clearOauthCookie: CookieOptions = {
  httpOnly: oauthCookie.httpOnly,
  secure: oauthCookie.secure,
  sameSite: oauthCookie.sameSite,
  path: oauthCookie.path,
};

/** Login page reasons (frontend: GOOGLE_ERRORS in data/auth.ts). */
export type GoogleErrorReason = "google_unavailable" | "google_cancelled" | "google_failed" | "google_conflict";

const randomToken = () => randomBytes(32).toString("base64url");

const sameToken = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

type GoogleControllerDeps = {
  auth: AuthService;
  google: GoogleClient;
  /** The website origin the browser is on (requests arrive through its /api rewrite). */
  appOrigin: string;
};

/**
 * GET /api/auth/google → redirect to Google; GET /api/auth/google/callback → session + redirect home.
 * Every outcome is a redirect back to the website (these are page navigations, not fetch calls);
 * failures land on /login?error=<reason>.
 */
export function createGoogleController({ auth, google, appOrigin }: GoogleControllerDeps) {
  // Must match an "Authorized redirect URI" of the Google client exactly.
  const redirectUri = `${appOrigin}/api/auth/google/callback`;
  const toLogin = (reason: GoogleErrorReason) => `${appOrigin}/login?error=${reason}`;

  const start: RequestHandler = (_req, res) => {
    if (!google.configured) {
      res.redirect(toLogin("google_unavailable"));
      return;
    }
    const state = randomToken();
    const nonce = randomToken();
    res.cookie(OAUTH_COOKIE, `${state}.${nonce}`, oauthCookie);
    res.redirect(google.authorizationUrl({ state, nonce, redirectUri }));
  };

  const callback: RequestHandler = async (req, res) => {
    const stored: unknown = req.cookies?.[OAUTH_COOKIE];
    res.clearCookie(OAUTH_COOKIE, clearOauthCookie);

    const { code, state, error } = req.query;
    // The person pressed "Cancel" on Google's screen (or Google refused).
    if (typeof error === "string") {
      res.redirect(toLogin("google_cancelled"));
      return;
    }

    const [storedState, nonce] = typeof stored === "string" ? stored.split(".") : [];
    // State must round-trip: proves this callback answers a sign-in this browser started (CSRF).
    if (!storedState || !nonce || typeof state !== "string" || typeof code !== "string" || !sameToken(state, storedState)) {
      res.redirect(toLogin("google_failed"));
      return;
    }

    try {
      const profile = await google.signIn({ code, nonce, redirectUri });
      const user = await auth.signInWithGoogle(profile);
      await startSession(res, user);
      res.redirect(`${appOrigin}/`);
    } catch (err) {
      if (err instanceof AppError && err.code === "CONFLICT") {
        res.redirect(toLogin("google_conflict"));
        return;
      }
      req.log.warn({ err }, "Google sign-in failed");
      res.redirect(toLogin("google_failed"));
    }
  };

  return { start, callback };
}
