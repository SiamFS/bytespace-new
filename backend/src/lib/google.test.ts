import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT, type JWTPayload } from "jose";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { createGoogleClient, verifyGoogleIdToken } from "./google.js";

const CLIENT_ID = "client-123.apps.googleusercontent.com";
const NONCE = "nonce-abc";

let keys: ReturnType<typeof createLocalJWKSet>;
let sign: (claims: JWTPayload, options?: { issuer?: string; audience?: string; expiresIn?: string }) => Promise<string>;

// A local key pair stands in for Google's signing keys (no network in tests).
beforeAll(async () => {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const jwk = { ...(await exportJWK(publicKey)), kid: "test-key", alg: "RS256", use: "sig" };
  keys = createLocalJWKSet({ keys: [jwk] });
  sign = (claims, { issuer = "https://accounts.google.com", audience = CLIENT_ID, expiresIn = "1h" } = {}) =>
    new SignJWT(claims)
      .setProtectedHeader({ alg: "RS256", kid: "test-key" })
      .setIssuer(issuer)
      .setAudience(audience)
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(privateKey);
});

const goodClaims = { sub: "google-1", email: "Jamie@Example.com", email_verified: true, name: "Jamie Davis", nonce: NONCE };
const verify = (token: string) => verifyGoogleIdToken(token, { keys, clientId: CLIENT_ID, nonce: NONCE });

describe("verifyGoogleIdToken", () => {
  it("returns the profile with a lowercased email", async () => {
    await expect(verify(await sign(goodClaims))).resolves.toEqual({
      sub: "google-1",
      email: "jamie@example.com",
      emailVerified: true,
      name: "Jamie Davis",
    });
  });

  it("accepts both issuer spellings Google documents", async () => {
    await expect(verify(await sign(goodClaims, { issuer: "accounts.google.com" }))).resolves.toBeTruthy();
  });

  it("rejects another app's token, a wrong issuer, an expired token or a wrong nonce", async () => {
    await expect(verify(await sign(goodClaims, { audience: "someone-else" }))).rejects.toThrow();
    await expect(verify(await sign(goodClaims, { issuer: "https://evil.example.com" }))).rejects.toThrow();
    await expect(verify(await sign(goodClaims, { expiresIn: "-1m" }))).rejects.toThrow();
    await expect(verify(await sign({ ...goodClaims, nonce: "replayed" }))).rejects.toThrow(/nonce/);
  });

  it("rejects a token signed by another key", async () => {
    const { privateKey } = await generateKeyPair("RS256");
    const forged = await new SignJWT(goodClaims)
      .setProtectedHeader({ alg: "RS256", kid: "test-key" })
      .setIssuer("https://accounts.google.com")
      .setAudience(CLIENT_ID)
      .setExpirationTime("1h")
      .sign(privateKey);
    await expect(verify(forged)).rejects.toThrow();
  });

  it("treats a missing email_verified as unverified and falls back to the email for the name", async () => {
    const profile = await verify(await sign({ sub: "google-2", email: "sam@example.com", nonce: NONCE }));
    expect(profile).toMatchObject({ emailVerified: false, name: "sam" });
  });

  it("needs sub and email", async () => {
    await expect(verify(await sign({ sub: "google-3", nonce: NONCE }))).rejects.toThrow(/email/);
  });
});

describe("createGoogleClient", () => {
  it("is not configured without credentials", () => {
    const client = createGoogleClient({ keys });
    expect(client.configured).toBe(false);
    expect(() => client.authorizationUrl({ state: "s", nonce: "n", redirectUri: "http://x/cb" })).toThrow(/not configured/);
  });

  it("builds the authorization URL Google expects", () => {
    const client = createGoogleClient({ clientId: CLIENT_ID, clientSecret: "secret", keys });
    const url = new URL(client.authorizationUrl({ state: "s1", nonce: "n1", redirectUri: "http://localhost:3000/cb" }));
    expect(url.origin + url.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: CLIENT_ID,
      response_type: "code",
      scope: "openid email profile",
      redirect_uri: "http://localhost:3000/cb",
      state: "s1",
      nonce: "n1",
      prompt: "select_account",
    });
  });

  it("exchanges the code and verifies the returned ID token", async () => {
    const idToken = await sign(goodClaims);
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ id_token: idToken, access_token: "a" }));
    const client = createGoogleClient({ clientId: CLIENT_ID, clientSecret: "secret", keys, fetch: fetchMock });

    const profile = await client.signIn({ code: "code-1", nonce: NONCE, redirectUri: "http://localhost:3000/cb" });
    expect(profile.sub).toBe("google-1");

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://oauth2.googleapis.com/token");
    expect(Object.fromEntries(new URLSearchParams(init!.body as URLSearchParams))).toEqual({
      code: "code-1",
      client_id: CLIENT_ID,
      client_secret: "secret",
      redirect_uri: "http://localhost:3000/cb",
      grant_type: "authorization_code",
    });
  });

  it("fails when Google rejects the code or sends no ID token", async () => {
    const rejecting = createGoogleClient({
      clientId: CLIENT_ID,
      clientSecret: "secret",
      keys,
      fetch: vi.fn<typeof fetch>().mockResolvedValue(Response.json({ error: "invalid_grant" }, { status: 400 })),
    });
    await expect(rejecting.signIn({ code: "c", nonce: NONCE, redirectUri: "x" })).rejects.toThrow(/HTTP 400/);

    const empty = createGoogleClient({
      clientId: CLIENT_ID,
      clientSecret: "secret",
      keys,
      fetch: vi.fn<typeof fetch>().mockResolvedValue(Response.json({ access_token: "a" })),
    });
    await expect(empty.signIn({ code: "c", nonce: NONCE, redirectUri: "x" })).rejects.toThrow(/id_token/);
  });
});
