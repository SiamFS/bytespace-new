import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { LegalPage } from "@/components/sections/LegalPage";
import { termsOfService } from "@/data/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using the ByteSpace demo learning platform.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <LegalPage document={termsOfService} />
      </main>
      <Footer />
    </>
  );
}
