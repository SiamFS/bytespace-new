import type { Request, RequestHandler } from "express";
import type { User } from "../generated/prisma/client.js";
import type { Mailer } from "../lib/mailer.js";
import { clearSessionCookie, SESSION_COOKIE, startSession } from "../lib/session.js";
import { verificationEmail } from "../lib/verificationEmail.js";
import { toPublicUser, type AuthService } from "../services/auth.service.js";

type AuthControllerDeps = {
  auth: AuthService;
  mailer: Mailer;
  /** The website origin — verification links point at its /verify-email page. */
  appOrigin: string;
};

/** What sign-up / resend tell the page about the email. */
type VerificationResult = {
  /** False if the email service failed — the page offers "Resend". */
  emailSent: boolean;
  /**
   * Only when no email service is configured (local / Docker): the link itself, so the page can
   * show it. Never present when Brevo is set up (production).
   */
  verificationUrl?: string;
};

/** HTTP layer for /api/auth. Bodies are already validated (middleware/validateBody). */
export function createAuthController({ auth, mailer, appOrigin }: AuthControllerDeps) {
  async function sendVerification(req: Request, user: User, token: string): Promise<VerificationResult> {
    const link = `${appOrigin}/verify-email?token=${encodeURIComponent(token)}`;
    try {
      await mailer.send(verificationEmail({ name: user.name, email: user.email, link }));
    } catch (err) {
      req.log.error({ err }, "Verification email failed");
      return { emailSent: false };
    }
    return mailer.delivers ? { emailSent: true } : { emailSent: false, verificationUrl: link };
  }

  /** Creates the account and emails the verification link. No session until the email is verified. */
  const register: RequestHandler = async (req, res) => {
    const { user, token } = await auth.register(req.body);
    const result = await sendVerification(req, user, token);
    res.status(201).json({ status: "verification_sent", email: user.email, ...result });
  };

  const login: RequestHandler = async (req, res) => {
    const user = await auth.login(req.body);
    await startSession(res, user);
    res.json({ user: toPublicUser(user) });
  };

  /** The link from the email: marks the address verified and signs the user in. */
  const verifyEmail: RequestHandler = async (req, res) => {
    const user = await auth.verifyEmail(req.body.token);
    await startSession(res, user);
    res.json({ user: toPublicUser(user) });
  };

  /**
   * Sends a new link to an unverified account. Always the same answer, so it can't reveal which
   * emails have accounts (except locally, where the link is returned when there's no email service).
   */
  const resendVerification: RequestHandler = async (req, res) => {
    const pending = await auth.resendVerification(req.body.email);
    const result = pending ? await sendVerification(req, pending.user, pending.token) : undefined;
    res.json({ status: "sent_if_unverified", ...(result?.verificationUrl ? { verificationUrl: result.verificationUrl } : {}) });
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

  return { register, login, verifyEmail, resendVerification, logout, me };
}
