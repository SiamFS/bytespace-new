import type { RequestHandler } from "express";
import { clearSessionCookie, SESSION_COOKIE, startSession } from "../lib/session.js";
import { toPublicUser, type AuthService } from "../services/auth.service.js";

/** HTTP layer for /api/auth. Bodies are already validated (middleware/validateBody). */
export function createAuthController(auth: AuthService) {
  const register: RequestHandler = async (req, res) => {
    const user = await auth.register(req.body);
    await startSession(res, user);
    res.status(201).json({ user: toPublicUser(user) });
  };

  const login: RequestHandler = async (req, res) => {
    const user = await auth.login(req.body);
    await startSession(res, user);
    res.json({ user: toPublicUser(user) });
  };

  /** Ends this browser's session (idempotent — fine to call when already signed out). */
  const logout: RequestHandler = (_req, res) => {
    res.clearCookie(SESSION_COOKIE, clearSessionCookie);
    res.status(204).end();
  };

  /** Current user, or `{ user: null }` when signed out (200 either way — being a guest isn't an error). */
  const me: RequestHandler = (_req, res) => {
    const user = res.locals.user;
    res.json({ user: user ? toPublicUser(user) : null });
  };

  return { register, login, logout, me };
}
