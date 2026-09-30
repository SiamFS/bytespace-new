/**
 * Where to go after signing in. Only same-site paths are allowed — `?next=https://evil.com`
 * or protocol-relative `//evil.com` would otherwise turn our login page into an open
 * redirect (Express security guide, "Prevent open redirects").
 */
export function safeNext(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  // Don't bounce back into the auth pages themselves.
  if (/^\/(login|register|signup)(\/|\?|#|$)/.test(next)) {
    return fallback;
  }
  return next;
}
