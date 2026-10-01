import { ApiError, getJson, postJson } from "@/lib/api";
import type { LoginValues, RegisterValues } from "./schemas";

export type User = { id: string; name: string; email: string; createdAt: string };

export const login = (values: LoginValues) => postJson<{ user: User }>("/api/auth/login", values);
export const register = (values: RegisterValues) => postJson<{ user: User }>("/api/auth/register", values);
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
