import type { CookieOptions } from "express";
import { jwtVerify, SignJWT } from "jose";
import { env } from "../config/env.js";

/** Cookie holding the session JWT. Generic name (Express security guide: don't fingerprint). */
export const SESSION_COOKIE = "session";
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

const key = new TextEncoder().encode(env.JWT_SECRET);
const ISSUER = "bytespace-api";
const AUDIENCE = "bytespace-web";

export type SessionClaims = {
  userId: string;
  /** User.tokenVersion when the token was issued — a bump revokes every older token. */
  version: number;
};

export function createSessionToken({ userId, version }: SessionClaims) {
  return new SignJWT({ ver: version })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(key);
}

/** Verifies signature, algorithm, issuer, audience and expiry. Any failure → null. */
export async function readSessionToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"], issuer: ISSUER, audience: AUDIENCE });
    if (typeof payload.sub !== "string" || typeof payload.ver !== "number") return null;
    return { userId: payload.sub, version: payload.ver };
  } catch {
    return null;
  }
}

/**
 * Next.js auth guide's recommended options: HttpOnly (no JS access), Secure (HTTPS only, in
 * production), SameSite=Lax (not sent on cross-site POSTs), Path=/, and an expiry.
 */
export const sessionCookie: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_TTL_SECONDS * 1000,
};

/** Same attributes minus the expiry — Express 5's clearCookie ignores maxAge/expires anyway. */
export const clearSessionCookie: CookieOptions = {
  httpOnly: sessionCookie.httpOnly,
  secure: sessionCookie.secure,
  sameSite: sessionCookie.sameSite,
  path: sessionCookie.path,
};
