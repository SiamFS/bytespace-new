import { SignJWT } from "jose";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma.js";
import { FRONTEND_ORIGIN, newUser, sessionCookie, setCookieHeader, testApp, uniqueEmail } from "./helpers.js";

const post = (app: ReturnType<typeof testApp>, path: string, body: unknown) =>
  request(app).post(path).set("Origin", FRONTEND_ORIGIN).send(body as object);

describe("POST /api/auth/register", () => {
  it("creates the user, starts a session and never returns the hash", async () => {
    const user = newUser();
    const res = await post(testApp(), "/api/auth/register", user);

    expect(res.status).toBe(201);
    expect(res.body.user).toEqual({ id: expect.any(String), name: "Jamie Davis", email: user.email, createdAt: expect.any(String) });
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|tokenVersion/);

    const cookie = setCookieHeader(res)!;
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Lax/);
    expect(cookie).toMatch(/Path=\//);
    expect(cookie).toMatch(/Max-Age=604800/);
    expect(res.headers["cache-control"]).toBe("no-store");
  });

  it("stores a bcrypt hash and the normalised email", async () => {
    const email = uniqueEmail();
    await post(testApp(), "/api/auth/register", { name: " Jamie Davis ", email: `  ${email.toUpperCase()} `, password: "secret123" });

    const stored = await prisma.user.findUniqueOrThrow({ where: { email } });
    expect(stored.name).toBe("Jamie Davis");
    expect(stored.passwordHash).toMatch(/^\$2[aby]\$/);
    expect(stored.passwordHash).not.toContain("secret123");
  });

  it("ignores fields the client must not set", async () => {
    const user = newUser();
    await post(testApp(), "/api/auth/register", { ...user, tokenVersion: 99, passwordHash: "x", id: "evil" });
    const stored = await prisma.user.findUniqueOrThrow({ where: { email: user.email } });
    expect(stored.tokenVersion).toBe(0);
    expect(stored.id).not.toBe("evil");
  });

  it("rejects a duplicate email with 409 on the email field", async () => {
    const app = testApp();
    const user = newUser();
    await post(app, "/api/auth/register", user);
    const res = await post(app, "/api/auth/register", { ...user, email: user.email.toUpperCase() });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatchObject({ code: "CONFLICT", fields: { email: "An account with this email already exists." } });
  });

  it("handles two simultaneous sign-ups for one email (unique constraint, not a race)", async () => {
    const app = testApp();
    const user = newUser();
    const statuses = (await Promise.all([post(app, "/api/auth/register", user), post(app, "/api/auth/register", user)])).map(
      (r) => r.status,
    );
    expect(statuses.sort()).toEqual([201, 409]);
  });

  it("returns every invalid field with the form's messages", async () => {
    const res = await post(testApp(), "/api/auth/register", { name: " ", email: "nope", password: "short" });
    expect(res.status).toBe(400);
    expect(res.body.error).toEqual({
      code: "VALIDATION_ERROR",
      message: "Please check the highlighted fields.",
      fields: {
        name: "Enter your full name",
        email: "Enter a valid email address",
        password: "Use at least 8 characters",
      },
    });
  });

  it("rejects missing or non-object bodies", async () => {
    const res = await post(testApp(), "/api/auth/register", []);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("limits sign-ups per IP", async () => {
    const app = testApp({
      rateLimits: {
        login: [],
        register: [{ name: "register-ip", limit: 2, windowSeconds: 3600, key: (req) => req.ip ?? "" }],
      },
    });
    await post(app, "/api/auth/register", newUser());
    await post(app, "/api/auth/register", newUser());
    const res = await post(app, "/api/auth/register", newUser());
    expect(res.status).toBe(429);
    expect(Number(res.headers["retry-after"])).toBeGreaterThan(0);
  });
});

describe("POST /api/auth/login", () => {
  async function registered() {
    const app = testApp();
    const user = newUser();
    await post(app, "/api/auth/register", user);
    return { app, user };
  }

  it("signs in with the right password (email case-insensitive)", async () => {
    const { app, user } = await registered();
    const res = await post(app, "/api/auth/login", { email: user.email.toUpperCase(), password: user.password });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(user.email);
    expect(setCookieHeader(res)).toMatch(/^session=/);
  });

  it("answers wrong password and unknown email identically", async () => {
    const { app, user } = await registered();
    const wrong = await post(app, "/api/auth/login", { email: user.email, password: "wrong-pass1" });
    const unknown = await post(app, "/api/auth/login", { email: uniqueEmail(), password: "wrong-pass1" });

    for (const res of [wrong, unknown]) {
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: { code: "UNAUTHORIZED", message: "Invalid email or password." } });
      expect(setCookieHeader(res)).toBeUndefined();
    }
  });

  it("locks an account out after 5 attempts per minute from one IP", async () => {
    const { app, user } = await registered();
    for (let i = 0; i < 5; i++) await post(app, "/api/auth/login", { email: user.email, password: "wrong-pass1" });
    const res = await post(app, "/api/auth/login", { email: user.email, password: user.password });

    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe("RATE_LIMITED");
    expect(Number(res.headers["retry-after"])).toBeGreaterThan(0);
    expect(Number(res.headers["retry-after"])).toBeLessThanOrEqual(60);
  });

  it("does not count invalid bodies against the limit", async () => {
    const { app, user } = await registered();
    for (let i = 0; i < 6; i++) await post(app, "/api/auth/login", { email: user.email, password: "" });
    const res = await post(app, "/api/auth/login", user);
    expect(res.status).toBe(200);
  });
});

describe("GET /api/auth/me and POST /api/auth/logout", () => {
  async function signedIn() {
    const app = testApp();
    const user = newUser();
    const res = await post(app, "/api/auth/register", user);
    return { app, user, cookie: sessionCookie(res), id: res.body.user.id as string };
  }

  it("returns the signed-in user", async () => {
    const { app, user, cookie } = await signedIn();
    const res = await request(app).get("/api/auth/me").set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(user.email);
    expect(res.headers["cache-control"]).toBe("no-store");
  });

  it("returns { user: null } for guests (200, not an error)", async () => {
    const res = await request(testApp()).get("/api/auth/me");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user: null });
    expect(setCookieHeader(res)).toBeUndefined();
  });

  it.each([
    ["garbage", "session=not-a-jwt"],
    ["wrong signature", "session=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4IiwidmVyIjowfQ.c2lnbmF0dXJl"],
  ])("treats a %s cookie as signed out and clears it", async (_label, cookie) => {
    const res = await request(testApp()).get("/api/auth/me").set("Cookie", cookie);
    expect(res.body).toEqual({ user: null });
    expect(setCookieHeader(res)).toMatch(/session=;.*Expires=Thu, 01 Jan 1970/);
  });

  it("rejects an expired token", async () => {
    const { app, id } = await signedIn();
    const key = new TextEncoder().encode(process.env.JWT_SECRET);
    const expired = await new SignJWT({ ver: 0 })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(id)
      .setIssuer("bytespace-api")
      .setAudience("bytespace-web")
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(key);
    const res = await request(app).get("/api/auth/me").set("Cookie", `session=${expired}`);
    expect(res.body).toEqual({ user: null });
  });

  it("rejects a token signed with another algorithm ('none')", async () => {
    const { app, id } = await signedIn();
    const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({ sub: id, ver: 0, iss: "bytespace-api", aud: "bytespace-web" })).toString("base64url");
    const res = await request(app).get("/api/auth/me").set("Cookie", `session=${header}.${payload}.`);
    expect(res.body).toEqual({ user: null });
  });

  it("revokes sessions when tokenVersion is bumped, and after the user is deleted", async () => {
    const { app, cookie, id } = await signedIn();
    await prisma.user.update({ where: { id }, data: { tokenVersion: { increment: 1 } } });
    expect((await request(app).get("/api/auth/me").set("Cookie", cookie)).body).toEqual({ user: null });

    const second = await signedIn();
    await prisma.user.delete({ where: { id: second.id } });
    expect((await request(second.app).get("/api/auth/me").set("Cookie", second.cookie)).body).toEqual({ user: null });
  });

  it("logs out by clearing the cookie (idempotent)", async () => {
    const { app, cookie } = await signedIn();
    const res = await post(app, "/api/auth/logout", {}).set("Cookie", cookie);
    expect(res.status).toBe(204);
    expect(setCookieHeader(res)).toMatch(/session=;.*Expires=Thu, 01 Jan 1970/);

    const again = await post(app, "/api/auth/logout", {});
    expect(again.status).toBe(204);
  });
});

describe("cross-site protection", () => {
  it("blocks writes from other origins", async () => {
    const res = await request(testApp())
      .post("/api/auth/login")
      .set("Origin", "https://evil.example.com")
      .send({ email: "a@b.co", password: "x" });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("only accepts JSON bodies (HTML forms can't send JSON cross-site)", async () => {
    const res = await request(testApp())
      .post("/api/auth/login")
      .set("Origin", FRONTEND_ORIGIN)
      .type("form")
      .send("email=a@b.co&password=x");
    expect(res.status).toBe(415);
    expect(res.body.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
  });

  it("allows requests without an Origin header (not a browser → not CSRF)", async () => {
    const res = await request(testApp()).post("/api/auth/logout").send({});
    expect(res.status).toBe(204);
  });
});
