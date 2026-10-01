import { z } from "zod";

const origin = z.url({ protocol: /^https?$/ }).refine((value) => new URL(value).origin === value, {
  message: "must be a bare origin like https://example.com (no path or trailing slash)",
});

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    )
    .pipe(z.array(origin).min(1)),
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  // Signs session JWTs (HS256). Generate with: openssl rand -base64 32
  JWT_SECRET: z.string().min(32, "must be at least 32 characters (generate one with: openssl rand -base64 32)"),
  // Rate-limit store. Optional: without it limits are kept in memory (fine for one instance).
  REDIS_URL: z.url({ protocol: /^rediss?$/ }).optional(),
  // bcrypt cost. 12 ≈ 250ms per hash on a small server; tests use 4 to stay fast.
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),
  // Sign-ups allowed per IP per hour. Raised only for automated full-stack test runs.
  REGISTER_LIMIT_PER_HOUR: z.coerce.number().int().min(1).default(5),
  // Google sign-in (Google Cloud Console → Clients → Web application). Optional: without them
  // the "Continue with Google" button explains that Google sign-in isn't available.
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  // Set to "1" by Vercel at runtime.
  VERCEL: z.string().optional(),
}).superRefine((value, ctx) => {
  if (Boolean(value.GOOGLE_CLIENT_ID) !== Boolean(value.GOOGLE_CLIENT_SECRET)) {
    ctx.addIssue({
      code: "custom",
      path: [value.GOOGLE_CLIENT_ID ? "GOOGLE_CLIENT_SECRET" : "GOOGLE_CLIENT_ID"],
      message: "set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, or neither",
    });
  }
  // Vercel can run several function instances at once — in-memory rate limits wouldn't be shared.
  if (value.VERCEL === "1" && !value.REDIS_URL) {
    ctx.addIssue({ code: "custom", path: ["REDIS_URL"], message: "REDIS_URL is required on Vercel (rate limits must be shared)" });
  }
});

export type Env = z.infer<typeof EnvSchema>;

/** Validates environment variables; throws one readable error listing every problem. */
export function parseEnv(source: NodeJS.ProcessEnv): Env {
  const result = EnvSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

/** Parsed once at startup — the process fails fast on a bad configuration. */
export const env = parseEnv(process.env);
