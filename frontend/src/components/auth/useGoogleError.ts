"use client";

import { useEffect, useState } from "react";
import { googleErrorMessages } from "@/data/auth";

/**
 * The message for `?error=<reason>` after a failed Google sign-in (the API redirects to
 * /login?error=…). Read after mounting, not with useSearchParams, so /login stays prerendered.
 */
export function useGoogleError() {
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("error");
    // Reading the URL is an external system; this runs once after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (reason && Object.hasOwn(googleErrorMessages, reason)) setMessage(googleErrorMessages[reason]);
  }, []);

  return message;
}
