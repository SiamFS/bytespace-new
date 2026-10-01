"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { resendVerification } from "@/lib/auth/api";

type State = { kind: "idle" | "sending" } | { kind: "sent"; verificationUrl?: string } | { kind: "error"; message: string };

const linkButton =
  "rounded-sm text-label-m text-primary-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-60";

/** "Resend email" for an unverified account (our design). The answer is the same whether or not the account exists. */
export function ResendVerification({ email }: { email: string }) {
  const [state, setState] = useState<State>({ kind: "idle" });

  async function resend() {
    setState({ kind: "sending" });
    try {
      const result = await resendVerification(email);
      setState({ kind: "sent", verificationUrl: result.verificationUrl });
    } catch (error) {
      const wait = error instanceof ApiError && error.code === "RATE_LIMITED" ? error.retryAfter : undefined;
      setState({
        kind: "error",
        message:
          error instanceof ApiError && error.code === "RATE_LIMITED"
            ? `Too many emails. Try again${wait ? ` in ${Math.ceil(wait / 60)} min` : " later"}.`
            : "Couldn't send the email. Please try again.",
      });
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button type="button" onClick={resend} disabled={state.kind === "sending"} className={linkButton}>
        {state.kind === "sending" ? "Sending…" : "Resend verification email"}
      </button>
      <p role="status" className="text-body-s text-neutral-600 empty:hidden">
        {state.kind === "sent" && !state.verificationUrl && `If ${email} still needs verifying, a new link is on its way.`}
        {state.kind === "error" && state.message}
      </p>
      {state.kind === "sent" && state.verificationUrl && <LocalLink href={state.verificationUrl} />}
    </div>
  );
}

/** No email service on this server (local / Docker): the API returned the link itself. */
export function LocalLink({ href }: { href: string }) {
  return (
    <p className="text-body-s text-neutral-600">
      Email isn&apos;t set up on this server, so here&apos;s your link:{" "}
      <a href={href} className="text-primary-800 underline">
        Verify your email
      </a>
    </p>
  );
}
