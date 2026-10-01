import type { VerificationSent } from "@/lib/auth/api";
import { LocalLink, ResendVerification } from "./ResendVerification";

/** Shown in place of the sign-up form once the account is created (our design — Figma has no such state). */
export function CheckEmailNotice({ result }: { result: VerificationSent }) {
  return (
    <div role="status" className="flex flex-col gap-4 rounded-xl bg-neutral-50 p-6">
      <h2 className="font-heading text-heading-xs text-neutral-950">Check your email</h2>
      {result.emailSent ? (
        <p className="text-body-m text-neutral-700">
          We sent a verification link to <strong className="font-medium text-neutral-950">{result.email}</strong>. Open
          it to finish creating your account — it works for 24 hours. Not there? Check your spam folder.
        </p>
      ) : result.verificationUrl ? (
        <LocalLink href={result.verificationUrl} />
      ) : (
        <p className="text-body-m text-neutral-700">
          Your account is created, but we couldn&apos;t send the email to{" "}
          <strong className="font-medium text-neutral-950">{result.email}</strong> just now. Please try again:
        </p>
      )}
      <ResendVerification email={result.email} />
    </div>
  );
}
