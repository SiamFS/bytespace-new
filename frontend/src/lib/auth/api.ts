import { ApiError, getJson, postJson } from "@/lib/api";
import type { LoginValues, RegisterValues } from "./schemas";

export type User = { id: string; name: string; email: string; createdAt: string };

export const login = (values: LoginValues) => postJson<{ user: User }>("/api/auth/login", values);
/** What sign-up (and resend) answer: no session until the email is verified. */
export type VerificationSent = {
  status: "verification_sent";
  email: string;
  /** False if the email couldn't be sent just now — offer "Resend". */
  emailSent: boolean;
  /** Only when the server has no email service (local / Docker): the link itself. */
  verificationUrl?: string;
};

export const register = (values: RegisterValues) => postJson<VerificationSent>("/api/auth/register", values);
/** The link from the email: verifies the address and signs in. */
export const verifyEmail = (token: string) => postJson<{ user: User }>("/api/auth/verify-email", { token });
/** Same answer whether or not the account exists (except the local-only link). */
export const resendVerification = (email: string) =>
  postJson<{ status: "sent_if_unverified"; verificationUrl?: string }>("/api/auth/resend-verification", { email });
/** Current user, or null when signed out (the API answers 200 either way). */
export const fetchSession = () => getJson<{ user: User | null }>("/api/auth/me");
export const logout = () => postJson<void>("/api/auth/logout", {});

export type FormErrors<Field extends string> = {
  /** Message shown above the submit button (role="alert"). */
  form?: string;
  /** Messages attached to individual fields. */
  fields?: Partial<Record<Field, string>>;
};

/** Turns an API failure into what the auth forms show. Never reveals whether an email exists on login. */
export function authErrorMessages<Field extends string>(error: unknown, formType: "login" | "register"): FormErrors<Field> {
  if (!(error instanceof ApiError)) {
    return { form: "Something went wrong. Please try again." };
  }
  switch (error.code) {
    case "VALIDATION_ERROR":
      return error.fields
        ? { fields: error.fields as Partial<Record<Field, string>> }
        : { form: "Please check the highlighted fields." };
    case "UNAUTHORIZED":
      return { form: "Invalid email or password." };
    case "EMAIL_NOT_VERIFIED":
      return { form: "Please verify your email first — open the link we sent you." };
    case "INVALID_TOKEN":
      return { form: "This link is invalid or has expired." };
    case "CONFLICT":
      return formType === "register"
        ? { fields: { email: "An account with this email already exists." } as Partial<Record<Field, string>> }
        : { form: "Something went wrong. Please try again." };
    case "RATE_LIMITED": {
      const wait = error.retryAfter;
      return {
        form: wait
          ? `Too many attempts. Try again in ${wait} second${wait === 1 ? "" : "s"}.`
          : "Too many attempts. Please wait a moment and try again.",
      };
    }
    case "TIMEOUT":
      return { form: "The server took too long to respond. Please try again." };
    case "BAD_RESPONSE":
      // Usually the free-tier API still waking up (its placeholder page, not our JSON).
      return { form: "The server is starting up. Please try again in a moment." };
    case "NETWORK_ERROR":
      return { form: "Can't reach the server. Check your connection and try again." };
    default:
      return { form: "Something went wrong. Please try again." };
  }
}
