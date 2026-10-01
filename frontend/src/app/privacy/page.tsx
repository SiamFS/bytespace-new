import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { LegalPage } from "@/components/sections/LegalPage";
import { privacyPolicy } from "@/data/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What ByteSpace stores when you create an account or sign in, and why.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <LegalPage document={privacyPolicy} />
      </main>
      <Footer />
    </>
  );
}
