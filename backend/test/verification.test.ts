import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import type { Email, Mailer } from "../src/lib/mailer.js";
import { prisma } from "../src/lib/prisma.js";
import { FRONTEND_ORIGIN, newUser, sessionCookie, setCookieHeader, signUpVerified, testApp, verificationToken } from "./helpers.js";

const post = (app: ReturnType<typeof testApp>, path: string, body: unknown) =>
  request(app).post(path).set("Origin", FRONTEND_ORIGIN).send(body as object);

/** Stand-in for Brevo: records what would be sent. */
function capturingMailer(): Mailer & { sent: Email[] } {
  const sent: Email[] = [];
  return { delivers: true, sent, send: vi.fn(async (email: Email) => void sent.push(email)) };
}

const linkIn = (email: Email) => email.html.match(/href="([^"]+)"/)![1]!.replace(/&amp;/g, "&");

describe("POST /api/auth/verify-email", () => {
  it("marks the email verified, signs in, and lets password login work", async () => {
    const app = testApp();
    const user = newUser();
    const signUp = await post(app, "/api/auth/register", user);

    const res = await post(app, "/api/auth/verify-email", { token: verificationToken(signUp) });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(user.email);
    expect((await request(app).get("/api/auth/me").set("Cookie", sessionCookie(res))).body.user.email).toBe(user.email);

    const stored = await prisma.user.findUniqueOrThrow({ where: { email: user.email } });
    expect(stored.emailVerifiedAt).toBeInstanceOf(Date);
    expect((await post(app, "/api/auth/login", user)).status).toBe(200);
  });

  it("works once — a used link is rejected", async () => {
    const app = testApp();
    const token = verificationToken(await post(app, "/api/auth/register", newUser()));
    await post(app, "/api/auth/verify-email", { token });
    const again = await post(app, "/api/auth/verify-email", { token });
    expect(again.status).toBe(400);
    expect(again.body.error.code).toBe("INVALID_TOKEN");
    expect(setCookieHeader(again)).toBeUndefined();
  });

  it("rejects an expired or made-up link", async () => {
    const app = testApp();
    const user = newUser();
    const token = verificationToken(await post(app, "/api/auth/register", user));
    const { id } = await prisma.user.findUniqueOrThrow({ where: { email: user.email } });
    await prisma.emailVerificationToken.updateMany({ where: { userId: id }, data: { expiresAt: new Date(Date.now() - 1000) } });

    expect((await post(app, "/api/auth/verify-email", { token })).body.error.code).toBe("INVALID_TOKEN");
    expect((await post(app, "/api/auth/verify-email", { token: "not-a-real-token" })).body.error.code).toBe("INVALID_TOKEN");
    expect((await post(app, "/api/auth/verify-email", {})).body.error.code).toBe("VALIDATION_ERROR");
  });

  it("stores only a hash of the token", async () => {
    const app = testApp();
    const user = newUser();
    const token = verificationToken(await post(app, "/api/auth/register", user));
    const { id } = await prisma.user.findUniqueOrThrow({ where: { email: user.email } });
    const [record] = await prisma.emailVerificationToken.findMany({ where: { userId: id } });
    expect(record!.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(record!.tokenHash).not.toContain(token);
  });
});

describe("POST /api/auth/resend-verification", () => {
  it("sends a new link and the old one stops working", async () => {
    const app = testApp();
    const user = newUser();
    const first = verificationToken(await post(app, "/api/auth/register", user));

    const res = await post(app, "/api/auth/resend-verification", { email: user.email });
    expect(res.status).toBe(200);
    const second = verificationToken(res);
    expect(second).not.toBe(first);

    expect((await post(app, "/api/auth/verify-email", { token: first })).status).toBe(400);
    expect((await post(app, "/api/auth/verify-email", { token: second })).status).toBe(200);
  });

  it("answers the same for unknown and already-verified emails (no account discovery)", async () => {
    const app = testApp();
    const { user } = await signUpVerified(app);
    const verified = await post(app, "/api/auth/resend-verification", { email: user.email });
    const unknown = await post(app, "/api/auth/resend-verification", { email: "nobody-here@example.com" });
    for (const res of [verified, unknown]) {
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "sent_if_unverified" });
    }
  });

  it("is rate limited (each resend is a real email)", async () => {
    const app = testApp();
    const user = newUser();
    await post(app, "/api/auth/register", user);
    for (let i = 0; i < 3; i++) await post(app, "/api/auth/resend-verification", { email: user.email });
    const res = await post(app, "/api/auth/resend-verification", { email: user.email });
    expect(res.status).toBe(429);
  });
});

describe("with an email service (Brevo) configured", () => {
  it("emails the link and never returns it to the browser", async () => {
    const mailer = capturingMailer();
    const app = testApp({ mailer });
    const user = newUser();

    const res = await post(app, "/api/auth/register", user);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ status: "verification_sent", email: user.email, emailSent: true });

    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0]!.to).toEqual({ email: user.email, name: "Jamie Davis" });
    expect(mailer.sent[0]!.subject).toBe("Verify your ByteSpace account");
    const link = new URL(linkIn(mailer.sent[0]!));
    expect(link.origin + link.pathname).toBe(`${FRONTEND_ORIGIN}/verify-email`);

    const verify = await post(app, "/api/auth/verify-email", { token: link.searchParams.get("token") });
    expect(verify.status).toBe(200);

    const resend = await post(app, "/api/auth/resend-verification", { email: user.email });
    expect(resend.body).toEqual({ status: "sent_if_unverified" });
  });

  it("still creates the account when sending fails, and says so (the page offers Resend)", async () => {
    const app = testApp({ mailer: { delivers: true, send: vi.fn().mockRejectedValue(new Error("Brevo down")) } });
    const user = newUser();
    const res = await post(app, "/api/auth/register", user);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ status: "verification_sent", email: user.email, emailSent: false });
    expect(await prisma.user.count({ where: { email: user.email } })).toBe(1);
  });
});
