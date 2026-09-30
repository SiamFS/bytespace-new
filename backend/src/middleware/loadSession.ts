import type { RequestHandler } from "express";
import { clearSessionCookie, readSessionToken, SESSION_COOKIE } from "../lib/session.js";
import type { AuthService } from "../services/auth.service.js";

/**
 * Reads the session cookie into `res.locals.user` (null when signed out). A cookie that no longer
 * works — bad signature, expired, revoked, user deleted — is cleared, so the browser stops sending
 * it (and the frontend's /login redirect for signed-in users can't trap a stale session).
 */
export function loadSession(auth: AuthService): RequestHandler {
  return async (req, res, next) => {
    res.locals.user = null;
    const token: unknown = req.cookies?.[SESSION_COOKIE];
    if (typeof token === "string" && token) {
      const claims = await readSessionToken(token);
      const user = claims ? await auth.findSessionUser(claims) : null;
      if (user) res.locals.user = user;
      else res.clearCookie(SESSION_COOKIE, clearSessionCookie);
    }
    next();
  };
}
