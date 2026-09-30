/** Copy for the Login / Register pages, exactly as in the Figma frames. */
export const authCopy = {
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

/** Social sign-in buttons (Login only). OAuth isn't set up, so they lead to placeholder routes. */
export const socialProviders = [
  { id: "facebook", label: "Continue with Facebook", href: "/auth/facebook" },
  { id: "google", label: "Continue with Google", href: "/auth/google" },
] as const;
