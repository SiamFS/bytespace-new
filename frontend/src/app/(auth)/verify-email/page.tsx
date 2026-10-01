import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthPromo } from "@/components/auth/AuthPromo";
import { VerifyEmail } from "@/components/auth/VerifyEmail";
import { authCopy } from "@/data/auth";

export const metadata: Metadata = { title: "Verify Email", robots: { index: false } };

const copy = authCopy.verify;

/** Opened from the verification email (our page — Figma has none; same layout as Register). */
export default function VerifyEmailPage() {
  return (
    <>
      <AuthPromo title={copy.promoTitle} text={copy.promoText} />
      <AuthCard
        eyebrow={copy.eyebrow}
        title={copy.title}
        layout="gap"
        prompt={copy.switchPrompt}
        promptTone="muted"
        switchLink={copy.switchLink}
      >
        <VerifyEmail />
      </AuthCard>
    </>
  );
}
