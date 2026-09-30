import { z } from "zod";

/**
 * Validation rules for the auth forms. The API validates with the same rules
 * (backend/src/schemas/auth.schema.ts); both run backend/test/fixtures/auth-validation-cases.json.
 */

/** bcrypt only uses the first 72 bytes of a password (bcrypt README) — longer ones would be cut silently. */
export const PASSWORD_MAX_BYTES = 72;
export const PASSWORD_MIN_CHARS = 8;

const utf8Bytes = (value: string) => new TextEncoder().encode(value).length;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter your email")
  .max(254, "Email is too long")
  .pipe(z.email("Enter a valid email address"));

export const loginSchema = z.object({
  email,
  // Login never reveals the password rules — just require something.
  password: z
    .string()
    .min(1, "Enter your password")
    // Same cap as the API (nothing longer can match a bcrypt hash) — not a policy hint.
    .refine((value) => utf8Bytes(value) <= 1024, { error: "Password is too long" }),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(60, "Name is too long (60 characters max)")
    // Letters from any language, plus spaces, apostrophes, hyphens and dots ("Anne-Marie O'Neil Jr.").
    .regex(/^[\p{L}\p{M}' .-]+$/u, "Use letters, spaces, apostrophes or hyphens only"),
  email,
  // Passwords are never trimmed: spaces are valid characters.
  password: z
    .string()
    .min(PASSWORD_MIN_CHARS, `Use at least ${PASSWORD_MIN_CHARS} characters`)
    .refine((value) => utf8Bytes(value) <= PASSWORD_MAX_BYTES, { error: "Password is too long" })
    .refine((value) => /\p{L}/u.test(value) && /\p{N}/u.test(value), {
      error: "Include at least one letter and one number",
    }),
});

export type LoginInput = z.input<typeof loginSchema>;
export type LoginValues = z.output<typeof loginSchema>;
export type RegisterInput = z.input<typeof registerSchema>;
export type RegisterValues = z.output<typeof registerSchema>;
