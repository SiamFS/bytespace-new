import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthPromo } from "@/components/auth/AuthPromo";
import { LoginForm } from "@/components/auth/LoginForm";
import { SocialSignIn } from "@/components/auth/SocialSignIn";
import { authCopy } from "@/data/auth";

export const metadata: Metadata = { title: "Sign In" };

const copy = authCopy.login;

export default function LoginPage() {
  return (
    <>
      <AuthPromo title={copy.promoTitle} text={copy.promoText} />
      <AuthCard
        eyebrow={copy.eyebrow}
        title={copy.title}
        layout="between"
        extra={<SocialSignIn />}
        prompt={copy.switchPrompt}
        promptTone="hint"
        switchLink={copy.switchLink}
      >
        <LoginForm />
      </AuthCard>
    </>
  );
}
