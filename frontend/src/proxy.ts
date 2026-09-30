import { NextResponse, type NextRequest } from "next/server";

/**
 * Signed-in users don't need the login / register pages → send them home.
 * Optimistic check only (Next.js auth guide: Proxy runs on every matched request, so no API or
 * database calls here) — it only looks for the cookie. A stale cookie is harmless: the API clears
 * it on the next session check, after which these pages open normally.
 */
export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  // Runs only for /login and /register, and only when a session cookie is present.
  matcher: [
    { source: "/login", has: [{ type: "cookie", key: "session" }] },
    { source: "/register", has: [{ type: "cookie", key: "session" }] },
  ],
};
