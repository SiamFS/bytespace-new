import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CoursesSection } from "@/components/sections/CoursesSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { LearningPathsSection } from "@/components/sections/LearningPathsSection";
import { PartnerLogos } from "@/components/sections/PartnerLogos";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <PartnerLogos />
        <CoursesSection />
        <LearningPathsSection />
      </main>
      <Footer />
    </>
  );
}
