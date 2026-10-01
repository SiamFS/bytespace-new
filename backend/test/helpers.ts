import { randomUUID } from "node:crypto";
import request, { type Response } from "supertest";
import { createApp, type AppDeps } from "../src/app.js";
import { MemoryRateLimitStore } from "../src/services/rateLimit.store.js";

export const FRONTEND_ORIGIN = "http://localhost:3000";

/** App with a fresh in-memory rate-limit store, so tests never share counters. */
export const testApp = (overrides: Partial<AppDeps> = {}) =>
  createApp({ rateLimitStore: new MemoryRateLimitStore(), ...overrides });

/** Unique per test — test files run in parallel against one database, so never reuse emails. */
export const uniqueEmail = () => `user-${randomUUID()}@example.com`;

export const newUser = () => ({ name: "Jamie Davis", email: uniqueEmail(), password: "secret123" });

/** The session cookie from a response ("session=<jwt>"), ready to send back. */
export function sessionCookie(res: Response): string {
  const header = res.headers["set-cookie"] as unknown as string[] | undefined;
  const cookie = header?.find((c) => c.startsWith("session="));
  if (!cookie) throw new Error("no session cookie in response");
  return cookie.split(";")[0]!;
}

export function setCookieHeader(res: Response): string | undefined {
  const header = res.headers["set-cookie"] as unknown as string[] | undefined;
  return header?.find((c) => c.startsWith("session="));
}

/** The verification token from a sign-up / resend response (tests have no email service, so the API returns the link). */
export function verificationToken(res: Response): string {
  const url = res.body.verificationUrl as string | undefined;
  if (!url) throw new Error("no verificationUrl in response");
  return new URL(url).searchParams.get("token")!;
}

/** Signs up and clicks the verification link: returns the verify response (user + session cookie). */
export async function signUpVerified(app: ReturnType<typeof testApp>, user = newUser()) {
  const signUp = await request(app).post("/api/auth/register").set("Origin", FRONTEND_ORIGIN).send(user);
  const verify = await request(app)
    .post("/api/auth/verify-email")
    .set("Origin", FRONTEND_ORIGIN)
    .send({ token: verificationToken(signUp) });
  if (verify.status !== 200) throw new Error(`verification failed: ${verify.status} ${JSON.stringify(verify.body)}`);
  return { user, res: verify, cookie: sessionCookie(verify), id: verify.body.user.id as string };
}
