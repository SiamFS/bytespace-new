import { z } from "zod";

/**
 * Request schemas for /api/auth. Same rules as the frontend forms
 * (frontend/src/lib/auth/schemas.ts); both sides run the shared cases in
 * frontend/src/lib/auth/auth-validation-cases.json, so CI fails if they ever drift apart.
 */

/** bcrypt only uses the first 72 bytes of a password — longer ones would be cut silently. */
export const PASSWORD_MAX_BYTES = 72;
export const PASSWORD_MIN_CHARS = 8;

const utf8Bytes = (value: string) => Buffer.byteLength(value, "utf8");

const email = z
  .string("Enter your email")
  .trim()
  .toLowerCase()
  .min(1, "Enter your email")
  .max(254, "Email is too long")
  .pipe(z.email("Enter a valid email address"));

export const loginSchema = z.object({
  email,
  password: z
    .string("Enter your password")
    .min(1, "Enter your password")
    // Not a policy hint: nothing longer can match a bcrypt hash, so don't spend CPU on it.
    .refine((value) => utf8Bytes(value) <= 1024, { error: "Password is too long" }),
});

export const registerSchema = z.object({
  name: z
    .string("Enter your full name")
    .trim()
    .min(2, "Enter your full name")
    .max(60, "Name is too long (60 characters max)")
    .regex(/^[\p{L}\p{M}' .-]+$/u, "Use letters, spaces, apostrophes or hyphens only"),
  email,
  password: z
    .string("Enter a password")
    .min(PASSWORD_MIN_CHARS, `Use at least ${PASSWORD_MIN_CHARS} characters`)
    .refine((value) => utf8Bytes(value) <= PASSWORD_MAX_BYTES, { error: "Password is too long" })
    .refine((value) => /\p{L}/u.test(value) && /\p{N}/u.test(value), {
      error: "Include at least one letter and one number",
    }),
});

export type LoginInput = z.output<typeof loginSchema>;
export type RegisterInput = z.output<typeof registerSchema>;
