"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
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

  useEffect(() => {
    if (!isSubmitting) return;
    const timer = setTimeout(() => setSlow(true), SLOW_REQUEST_MS);
    return () => clearTimeout(timer);
  }, [isSubmitting]);

  async function run(request: () => Promise<{ user: User }>) {
    setFormError(undefined);
    setSlow(false);
    setSubmitted(true);
    let user: User;
    try {
      ({ user } = await request());
    } catch (error) {
      const messages = authErrorMessages<Path<Values>>(error, formType);
      for (const [field, message] of Object.entries(messages.fields ?? {})) {
        setError(field as Path<Values>, { type: "server", message: message as string }, { shouldFocus: true });
      }
      setFormError(messages.form);
      return;
    }
    // The navbar shows the user immediately — no extra /me request.
    setSessionUser(user);
    // Read ?next= at submit time (not useSearchParams) so the page stays fully prerendered.
    router.replace(safeNext(new URLSearchParams(window.location.search).get("next")));
  }

  // The hint only matters while a request is in flight.
  // `submitted`: the form has been sent at least once (older page messages no longer apply).
  return { run, formError, slow: slow && isSubmitting, submitted };
}
