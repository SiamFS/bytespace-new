"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/lib/api";
import { authErrorMessages, type User } from "@/lib/auth/api";
import { safeNext } from "@/lib/auth/redirect";
import { useSetSessionUser } from "@/lib/auth/useSession";

/** After this long without an answer, explain that the free-tier server may be waking up. */
export const SLOW_REQUEST_MS = 5000;

/**
 * Shared submit flow for the auth forms: call the API, map failures onto fields / a form
 * message, show a "waking up" hint on slow requests, and navigate on success.
 */
export function useAuthSubmit<Values extends FieldValues>(
  formType: "login" | "register",
  setError: UseFormSetError<Values>,
  isSubmitting: boolean,
) {
  const router = useRouter();
  const setSessionUser = useSetSessionUser();
  const [formError, setFormError] = useState<string>();
  const [slow, setSlow] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorCode, setErrorCode] = useState<string>();

  useEffect(() => {
    if (!isSubmitting) return;
    const timer = setTimeout(() => setSlow(true), SLOW_REQUEST_MS);
    return () => clearTimeout(timer);
  }, [isSubmitting]);

  /**
   * Sends the form. A response with a `user` (login) signs in and navigates; anything else (sign-up:
   * "verification sent") is returned for the form to show. Failures land on fields / the form message.
   */
  async function run<T extends object>(request: () => Promise<T>): Promise<T | undefined> {
    setFormError(undefined);
    setErrorCode(undefined);
    setSlow(false);
    setSubmitted(true);
    let result: T;
    try {
      result = await request();
    } catch (error) {
      const messages = authErrorMessages<Path<Values>>(error, formType);
      for (const [field, message] of Object.entries(messages.fields ?? {})) {
        setError(field as Path<Values>, { type: "server", message: message as string }, { shouldFocus: true });
      }
      setFormError(messages.form);
      setErrorCode(error instanceof ApiError ? error.code : undefined);
      return undefined;
    }
    if ("user" in result) {
      // The navbar shows the user immediately — no extra /me request.
      setSessionUser(result.user as User);
      // Read ?next= at submit time (not useSearchParams) so the page stays fully prerendered.
      router.replace(safeNext(new URLSearchParams(window.location.search).get("next")));
    }
    return result;
  }

  // The hint only matters while a request is in flight.
  // `submitted`: the form has been sent at least once (older page messages no longer apply).
  // `errorCode`: the API code of the last failure (e.g. EMAIL_NOT_VERIFIED → offer "Resend").
  return { run, formError, errorCode, slow: slow && isSubmitting, submitted };
}
