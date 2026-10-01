import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";

/**
 * Google sign-in, OpenID Connect authorization code flow (server side), following Google's
 * "OpenID Connect" guide: redirect with `state` + `nonce` → exchange the code at the token
 * endpoint → verify the ID token (signature from Google's JWKS, issuer, audience, expiry, nonce).
 */
const AUTHORIZATION_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
// `jwks_uri` from https://accounts.google.com/.well-known/openid-configuration
const JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const ISSUERS = ["https://accounts.google.com", "accounts.google.com"];
const NAME_MAX = 60;

export type GoogleProfile = {
  /** Stable, unique account id — Google: use `sub`, never the email, as the identifier. */
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
};

export type GoogleClient = {
  /** False when GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET aren't set. */
  readonly configured: boolean;
  authorizationUrl(input: { state: string; nonce: string; redirectUri: string }): string;
  /** Exchanges the callback `code` and returns the verified profile. Throws on any failure. */
  signIn(input: { code: string; nonce: string; redirectUri: string }): Promise<GoogleProfile>;
};

type GoogleClientOptions = {
  clientId?: string | undefined;
  clientSecret?: string | undefined;
  /** Key source for ID token signatures (tests pass a local JWKS). */
  keys?: JWTVerifyGetKey;
  fetch?: typeof fetch;
};

/** Verifies a Google ID token and maps its claims. Throws if anything doesn't check out. */
export async function verifyGoogleIdToken(
  idToken: string,
  { keys, clientId, nonce }: { keys: JWTVerifyGetKey; clientId: string; nonce: string },
): Promise<GoogleProfile> {
  const { payload } = await jwtVerify(idToken, keys, { issuer: ISSUERS, audience: clientId, algorithms: ["RS256"] });
  if (payload["nonce"] !== nonce) throw new Error("ID token nonce mismatch");

  const { sub } = payload;
  const email = payload["email"];
  if (typeof sub !== "string" || !sub || typeof email !== "string" || !email) {
    throw new Error("ID token is missing sub or email");
  }
  const normalizedEmail = email.trim().toLowerCase();
  const rawName = typeof payload["name"] === "string" ? payload["name"].trim() : "";
  return {
    sub,
    email: normalizedEmail,
    emailVerified: payload["email_verified"] === true,
    name: (rawName || normalizedEmail.split("@")[0]!).slice(0, NAME_MAX),
  };
}

export function createGoogleClient({
  clientId,
  clientSecret,
  keys = createRemoteJWKSet(new URL(JWKS_URL)),
  fetch: fetchImpl = fetch,
}: GoogleClientOptions): GoogleClient {
  const credentials = clientId && clientSecret ? { clientId, clientSecret } : null;
  const requireCredentials = () => {
    if (!credentials) throw new Error("Google sign-in is not configured");
    return credentials;
  };

  return {
    configured: credentials !== null,

    authorizationUrl({ state, nonce, redirectUri }) {
      const { clientId: id } = requireCredentials();
      const params = new URLSearchParams({
        client_id: id,
        response_type: "code",
        scope: "openid email profile",
        redirect_uri: redirectUri,
        state,
        nonce,
        // Let people pick an account instead of silently reusing the last one.
        prompt: "select_account",
      });
      return `${AUTHORIZATION_ENDPOINT}?${params}`;
    },

    async signIn({ code, nonce, redirectUri }) {
      const { clientId: id, clientSecret: secret } = requireCredentials();
      const response = await fetchImpl(TOKEN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: id,
          client_secret: secret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error(`Google token exchange failed (HTTP ${response.status})`);
      const body = (await response.json()) as { id_token?: unknown };
      if (typeof body.id_token !== "string") throw new Error("Google token response has no id_token");
      return verifyGoogleIdToken(body.id_token, { keys, clientId: id, nonce });
    },
  };
}
