import { randomUUID } from "node:crypto";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import type { GoogleClient, GoogleProfile } from "../src/lib/google.js";
import { prisma } from "../src/lib/prisma.js";
import { FRONTEND_ORIGIN, newUser, sessionCookie, testApp, uniqueEmail } from "./helpers.js";

const LOGIN = `${FRONTEND_ORIGIN}/login`;
const REDIRECT_URI = `${FRONTEND_ORIGIN}/api/auth/google/callback`;

/** Stand-in for Google: records the authorization request and returns `profile` for any code. */
function fakeGoogle(profile: Partial<GoogleProfile> = {}, overrides: Partial<GoogleClient> = {}) {
  const fullProfile: GoogleProfile = {
    sub: `google-${randomUUID()}`,
    email: uniqueEmail(),
    emailVerified: true,
    name: "Jamie Davis",
    ...profile,
  };
  const client: GoogleClient = {
    configured: true,
    authorizationUrl: ({ state, nonce, redirectUri }) =>
      `https://accounts.google.test/auth?${new URLSearchParams({ state, nonce, redirect_uri: redirectUri })}`,
    signIn: vi.fn(async () => fullProfile),
    ...overrides,
  };
  return { client, profile: fullProfile };
}

/** The oauth cookie from a response ("oauth_google=<state>.<nonce>"). */
function oauthCookie(res: request.Response) {
  const header = res.headers["set-cookie"] as unknown as string[];
  return header.find((c) => c.startsWith("oauth_google="))!;
}

/** Runs the start step and returns what the browser would carry to the callback. */
async function startSignIn(app: ReturnType<typeof testApp>) {
  const res = await request(app).get("/api/auth/google");
  const cookie = oauthCookie(res).split(";")[0]!;
  const state = new URL(res.headers.location!).searchParams.get("state")!;
  return { res, cookie, state };
}

const callback = (app: ReturnType<typeof testApp>, query: Record<string, string>, cookie?: string) => {
  const req = request(app).get(`/api/auth/google/callback?${new URLSearchParams(query)}`);
  return cookie ? req.set("Cookie", cookie) : req;
};

describe("GET /api/auth/google", () => {
  it("sends the browser to Google with a fresh state + nonce kept in a short-lived cookie", async () => {
    const { client } = fakeGoogle();
    const { res } = await startSignIn(testApp({ google: client }));

    expect(res.status).toBe(302);
    const location = new URL(res.headers.location!);
    expect(location.origin).toBe("https://accounts.google.test");
    expect(location.searchParams.get("redirect_uri")).toBe(REDIRECT_URI);

    const cookie = oauthCookie(res);
    const [state, nonce] = cookie.split(";")[0]!.split("=")[1]!.split(".");
    expect(location.searchParams.get("state")).toBe(state);
    expect(location.searchParams.get("nonce")).toBe(nonce);
    expect(state).toMatch(/^[\w-]{43}$/);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Lax/);
    expect(cookie).toMatch(/Path=\/api\/auth\/google/);
    expect(cookie).toMatch(/Max-Age=600/);
  });

  it("explains on the login page when Google sign-in isn't configured", async () => {
    const { client } = fakeGoogle({}, { configured: false });
    const res = await request(testApp({ google: client })).get("/api/auth/google");
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(`${LOGIN}?error=google_unavailable`);
  });
});

describe("GET /api/auth/google/callback", () => {
  it("creates the account, starts a session and goes home", async () => {
    const { client, profile } = fakeGoogle();
    const app = testApp({ google: client });
    const { cookie, state } = await startSignIn(app);

    const res = await callback(app, { code: "code-1", state }, cookie);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(`${FRONTEND_ORIGIN}/`);
    expect(client.signIn).toHaveBeenCalledWith({ code: "code-1", nonce: cookie.split(".")[1], redirectUri: REDIRECT_URI });

    const stored = await prisma.user.findUniqueOrThrow({ where: { googleId: profile.sub } });
    expect(stored).toMatchObject({ email: profile.email, name: "Jamie Davis", passwordHash: null });

    // The new session works and the one-time oauth cookie is cleared.
    const me = await request(app).get("/api/auth/me").set("Cookie", sessionCookie(res));
    expect(me.body.user).toMatchObject({ email: profile.email });
    expect(oauthCookie(res)).toMatch(/oauth_google=;/);
  });

  it("signs a returning Google user into the same account", async () => {
    const { client, profile } = fakeGoogle();
    const app = testApp({ google: client });
    for (let i = 0; i < 2; i++) {
      const { cookie, state } = await startSignIn(app);
      await callback(app, { code: "c", state }, cookie);
    }
    expect(await prisma.user.count({ where: { email: profile.email } })).toBe(1);
  });

  it("links Google to an existing password account when Google verified the email", async () => {
    const app0 = testApp();
    const user = newUser();
    await request(app0).post("/api/auth/register").set("Origin", FRONTEND_ORIGIN).send(user);

    const { client, profile } = fakeGoogle({ email: user.email, emailVerified: true });
    const app = testApp({ google: client });
    const { cookie, state } = await startSignIn(app);
    const res = await callback(app, { code: "c", state }, cookie);

    expect(res.headers.location).toBe(`${FRONTEND_ORIGIN}/`);
    const stored = await prisma.user.findUniqueOrThrow({ where: { email: user.email } });
    expect(stored.googleId).toBe(profile.sub);
    expect(stored.passwordHash).not.toBeNull(); // the password keeps working
  });

  it("refuses to take over an existing account when the email isn't verified by Google", async () => {
    const user = newUser();
    await request(testApp()).post("/api/auth/register").set("Origin", FRONTEND_ORIGIN).send(user);

    const { client } = fakeGoogle({ email: user.email, emailVerified: false });
    const app = testApp({ google: client });
    const { cookie, state } = await startSignIn(app);
    const res = await callback(app, { code: "c", state }, cookie);

    expect(res.headers.location).toBe(`${LOGIN}?error=google_conflict`);
    expect(res.headers["set-cookie"]?.toString()).not.toMatch(/session=[^;]/);
    expect((await prisma.user.findUniqueOrThrow({ where: { email: user.email } })).googleId).toBeNull();
  });

  it("rejects a callback whose state doesn't match this browser's (login CSRF)", async () => {
    const { client } = fakeGoogle();
    const app = testApp({ google: client });
    const { cookie } = await startSignIn(app);

    const forged = await callback(app, { code: "c", state: "attacker-state" }, cookie);
    expect(forged.headers.location).toBe(`${LOGIN}?error=google_failed`);
    const noCookie = await callback(app, { code: "c", state: "whatever" });
    expect(noCookie.headers.location).toBe(`${LOGIN}?error=google_failed`);
    expect(client.signIn).not.toHaveBeenCalled();
  });

  it("goes back to the login page when the person cancels on Google", async () => {
    const { client } = fakeGoogle();
    const app = testApp({ google: client });
    const { cookie, state } = await startSignIn(app);
    const res = await callback(app, { error: "access_denied", state }, cookie);
    expect(res.headers.location).toBe(`${LOGIN}?error=google_cancelled`);
  });

  it("reports a failed code exchange / token check without leaking details", async () => {
    const { client } = fakeGoogle({}, { signIn: vi.fn(async () => Promise.reject(new Error("bad id token"))) });
    const app = testApp({ google: client });
    const { cookie, state } = await startSignIn(app);
    const res = await callback(app, { code: "c", state }, cookie);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(`${LOGIN}?error=google_failed`);
  });
});

describe("Google-only accounts and passwords", () => {
  it("can't be signed into with a password (there is none)", async () => {
    const { client, profile } = fakeGoogle();
    const app = testApp({ google: client });
    const { cookie, state } = await startSignIn(app);
    await callback(app, { code: "c", state }, cookie);

    const res = await request(app)
      .post("/api/auth/login")
      .set("Origin", FRONTEND_ORIGIN)
      .send({ email: profile.email, password: "anything-at-all" });
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe("Invalid email or password.");
  });
});
