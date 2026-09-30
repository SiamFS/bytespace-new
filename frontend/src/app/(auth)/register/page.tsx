import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthPromo } from "@/components/auth/AuthPromo";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { authCopy } from "@/data/auth";

export const metadata: Metadata = { title: "Create an Account" };

const copy = authCopy.register;

export default function RegisterPage() {
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
        <RegisterForm />
      </AuthCard>
    </>
  );
}
