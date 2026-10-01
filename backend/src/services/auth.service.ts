import { createHash, randomBytes } from "node:crypto";
import { Prisma, type PrismaClient, type User } from "../generated/prisma/client.js";
import { AppError } from "../lib/errors.js";
import type { GoogleProfile } from "../lib/google.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import type { SessionClaims } from "../lib/session.js";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema.js";

/** What the API returns about a user — never the password hash or token version. */
export type PublicUser = { id: string; name: string; email: string; createdAt: string };

export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt.toISOString(),
});

/** How long a "verify your email" link works. */
export const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** A new account (or a resend) and the one-time token for its verification link. */
export type PendingVerification = { user: User; token: string };

export type AuthService = {
  /** Creates an unverified account and its first verification token (no session yet). */
  register(input: RegisterInput): Promise<PendingVerification>;
  /** Password login. Refuses accounts whose email isn't verified (403 EMAIL_NOT_VERIFIED). */
  login(input: LoginInput): Promise<User>;
  /** Marks the email verified for a valid, unexpired token and returns the user. */
  verifyEmail(token: string): Promise<User>;
  /** A fresh token for an unverified account, or null (no such account / already verified). */
  resendVerification(email: string): Promise<PendingVerification | null>;
  /** Finds or creates the user for a verified Google profile (see the method for linking rules). */
  signInWithGoogle(profile: GoogleProfile): Promise<User>;
  /** The user a session token belongs to, or null if deleted / revoked. */
  findSessionUser(claims: SessionClaims): Promise<User | null>;
};

export function createAuthService(prisma: PrismaClient): AuthService {
  /** Replaces any earlier tokens of the user (only the newest link works). */
  async function issueToken(userId: string) {
    const token = randomBytes(32).toString("base64url");
    await prisma.$transaction([
      prisma.emailVerificationToken.deleteMany({ where: { userId } }),
      prisma.emailVerificationToken.create({
        data: { userId, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS) },
      }),
    ]);
    return token;
  }

  return {
    async register({ name, email, password }) {
      const passwordHash = await hashPassword(password);
      let user: User;
      try {
        user = await prisma.user.create({ data: { name, email, passwordHash } });
      } catch (error) {
        // Unique violation on email. Relying on the constraint (not a lookup first) also covers
        // two sign-ups for the same email arriving at the same time.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          throw new AppError(409, "CONFLICT", "An account with this email already exists.", {
            email: "An account with this email already exists.",
          });
        }
        throw error;
      }
      return { user, token: await issueToken(user.id) };
    },

    async login({ email, password }) {
      const user = await prisma.user.findUnique({ where: { email } });
      // Always runs bcrypt (dummy hash for unknown emails) and always says the same thing.
      const valid = await verifyPassword(password, user?.passwordHash ?? null);
      if (!user || !valid) {
        throw new AppError(401, "UNAUTHORIZED", "Invalid email or password.");
      }
      // Only after the password is right, so this can't be used to probe for accounts.
      if (!user.emailVerifiedAt) {
        throw new AppError(403, "EMAIL_NOT_VERIFIED", "Please verify your email first — check your inbox for our link.");
      }
      return user;
    },

    async verifyEmail(token) {
      const record = await prisma.emailVerificationToken.findUnique({
        where: { tokenHash: hashToken(token) },
        include: { user: true },
      });
      if (!record || record.expiresAt.getTime() < Date.now()) {
        throw new AppError(400, "INVALID_TOKEN", "This link is invalid or has expired. Request a new one from the login page.");
      }
      const [user] = await prisma.$transaction([
        prisma.user.update({
          where: { id: record.userId },
          data: { emailVerifiedAt: record.user.emailVerifiedAt ?? new Date() },
        }),
        prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } }),
      ]);
      return user;
    },

    async resendVerification(email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || user.emailVerifiedAt) return null;
      return { user, token: await issueToken(user.id) };
    },

    async signInWithGoogle(profile) {
      // Google has confirmed the address when email_verified is true.
      const verifiedAt = profile.emailVerified ? new Date() : null;
      const linked = await prisma.user.findUnique({ where: { googleId: profile.sub } });
      if (linked) return linked;

      const existing = await prisma.user.findUnique({ where: { email: profile.email } });
      if (existing) {
        // Link Google to an email/password account only when Google vouches for the address —
        // otherwise anyone could add an unverified address to a Google account and take it over.
        if (!profile.emailVerified || existing.googleId) {
          throw new AppError(409, "CONFLICT", "An account with this email already exists. Sign in with your password.");
        }
        return prisma.user.update({
          where: { id: existing.id },
          data: { googleId: profile.sub, emailVerifiedAt: existing.emailVerifiedAt ?? verifiedAt },
        });
      }

      try {
        return await prisma.user.create({
          data: { name: profile.name, email: profile.email, googleId: profile.sub, passwordHash: null, emailVerifiedAt: verifiedAt },
        });
      } catch (error) {
        // Two callbacks for the same new account at once: the other one created it.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          const user = await prisma.user.findUnique({ where: { googleId: profile.sub } });
          if (user) return user;
        }
        throw error;
      }
    },

    async findSessionUser({ userId, version }) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return user && user.tokenVersion === version ? user : null;
    },
  };
}
