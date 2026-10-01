/** Copy for the Login / Register pages, exactly as in the Figma frames (verify: our page, same style). */
export const authCopy = {
  verify: {
    promoTitle: "One click and you're in",
    promoText: "Confirming your email keeps your account safe and makes sure we can reach you.",
    eyebrow: "Verify Email",
    title: "Almost there",
    switchPrompt: "Already verified?",
    switchLink: { label: "Login", href: "/login" },
  },
  login: {
    promoTitle: "Sign in with ease",
    promoText:
      "Experience a seamless and efficient sign-in process that grants you instant access to a world of knowledge.",
    eyebrow: "Sign In",
    title: "Welcome Back",
    submit: "Sign In",
    pending: "Signing in…",
    switchPrompt: "New user?",
    switchLink: { label: "Create an account", href: "/register" },
  },
  register: {
    promoTitle: "Sign up and come in",
    promoText:
      "The registration process is straightforward, uncomplicated, and efficient, allowing users to sign up quickly, easily, and at no cost",
    eyebrow: "Create an Account",
    title: "Welcome to ByteSpace",
    submit: "Continue",
    pending: "Creating account…",
    switchPrompt: "Already have an account?",
    switchLink: { label: "Login", href: "/login" },
  },
} as const;

/**
 * Social sign-in buttons (Login only). Google is real: a full-page navigation to the API, which
 * redirects to Google and back. Facebook is still a placeholder route (no app registered).
 */
export const socialProviders = [
  { id: "facebook", label: "Continue with Facebook", href: "/auth/facebook", kind: "placeholder" },
  { id: "google", label: "Continue with Google", href: "/api/auth/google", kind: "oauth" },
] as const;

/** Messages for /login?error=<reason> — the API sends people back here when Google sign-in fails. */
export const googleErrorMessages: Record<string, string> = {
  google_unavailable: "Google sign-in isn't available right now. Please sign in with your email.",
  google_cancelled: "Google sign-in was cancelled.",
  google_failed: "Google sign-in didn't work. Please try again.",
  google_conflict: "An account with this email already exists. Sign in with your password.",
};
