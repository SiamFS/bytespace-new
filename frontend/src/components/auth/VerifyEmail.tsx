"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import { verifyEmail } from "@/lib/auth/api";
import { useSetSessionUser } from "@/lib/auth/useSession";

type State = { kind: "verifying" } | { kind: "done"; name: string } | { kind: "failed"; message: string };

/** Time to read "Email verified" before going to the home page. */
export const VERIFIED_REDIRECT_MS = 1500;

/**
 * Handles the link from the verification email (/verify-email?token=…): verifies, signs in and
 * goes home. The token is read after mounting (not useSearchParams) so the page stays static.
 */
export function VerifyEmail() {
  const router = useRouter();
  const setSessionUser = useSetSessionUser();
  const [state, setState] = useState<State>({ kind: "verifying" });
  // React strict mode runs effects twice in development; a token works only once.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ kind: "failed", message: "This link is incomplete. Open the full link from the email." });
      return;
    }
    verifyEmail(token)
      .then(({ user }) => {
        setSessionUser(user);
        setState({ kind: "done", name: user.name.split(/\s+/)[0] ?? user.name });
        setTimeout(() => router.replace("/"), VERIFIED_REDIRECT_MS);
      })
      .catch((error: unknown) =>
        setState({
          kind: "failed",
          message:
            error instanceof ApiError && error.code === "INVALID_TOKEN"
              ? "This link is invalid or has expired. Log in to get a new one."
              : "Couldn't verify your email right now. Please try the link again.",
        }),
      );
  }, [router, setSessionUser]);

  return (
    <div role="status" className="flex flex-col gap-4">
      {state.kind === "verifying" && <p className="text-body-l text-neutral-700">Verifying your email…</p>}
      {state.kind === "done" && (
        <>
          <p className="font-heading text-heading-xs text-neutral-950">Email verified — welcome, {state.name}!</p>
          <p className="text-body-m text-neutral-700">Taking you to the home page…</p>
        </>
      )}
      {state.kind === "failed" && (
        <>
          <p className="text-body-l text-danger">{state.message}</p>
          <Link
            href="/login"
            className="self-start rounded-sm text-label-m text-primary-800 hover:underline focus-visible:outline-2 focus-visible:outline-primary-600"
          >
            Go to login
          </Link>
        </>
      )}
    </div>
  );
}
