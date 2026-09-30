import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { PartnerLogos } from "@/components/sections/PartnerLogos";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <PartnerLogos />
      </main>
      <Footer />
    </>
  );
}
