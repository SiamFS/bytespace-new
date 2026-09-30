"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { authErrorMessages } from "@/lib/auth/api";
import { safeNext } from "@/lib/auth/redirect";

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
  const [formError, setFormError] = useState<string>();
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!isSubmitting) return;
    const timer = setTimeout(() => setSlow(true), SLOW_REQUEST_MS);
    return () => clearTimeout(timer);
  }, [isSubmitting]);

  async function run(request: () => Promise<unknown>) {
    setFormError(undefined);
    setSlow(false);
    try {
      await request();
    } catch (error) {
      const messages = authErrorMessages<Path<Values>>(error, formType);
      for (const [field, message] of Object.entries(messages.fields ?? {})) {
        setError(field as Path<Values>, { type: "server", message: message as string }, { shouldFocus: true });
      }
      setFormError(messages.form);
      return;
    }
    // Read ?next= at submit time (not useSearchParams) so the page stays fully prerendered.
    router.replace(safeNext(new URLSearchParams(window.location.search).get("next")));
    router.refresh();
  }

  // The hint only matters while a request is in flight.
  return { run, formError, slow: slow && isSubmitting };
}
