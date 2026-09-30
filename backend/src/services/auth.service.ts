import { Prisma, type PrismaClient, type User } from "../generated/prisma/client.js";
import { AppError } from "../lib/errors.js";
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

export type AuthService = {
  register(input: RegisterInput): Promise<User>;
  login(input: LoginInput): Promise<User>;
  /** The user a session token belongs to, or null if deleted / revoked. */
  findSessionUser(claims: SessionClaims): Promise<User | null>;
};

export function createAuthService(prisma: PrismaClient): AuthService {
  return {
    async register({ name, email, password }) {
      const passwordHash = await hashPassword(password);
      try {
        return await prisma.user.create({ data: { name, email, passwordHash } });
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
    },

    async login({ email, password }) {
      const user = await prisma.user.findUnique({ where: { email } });
      // Always runs bcrypt (dummy hash for unknown emails) and always says the same thing.
      const valid = await verifyPassword(password, user?.passwordHash ?? null);
      if (!user || !valid) {
        throw new AppError(401, "UNAUTHORIZED", "Invalid email or password.");
      }
      return user;
    },

    async findSessionUser({ userId, version }) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return user && user.tokenVersion === version ? user : null;
    },
  };
}
