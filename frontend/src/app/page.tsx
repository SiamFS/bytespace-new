import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CoursesSection } from "@/components/sections/CoursesSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { GrowthSection } from "@/components/sections/GrowthSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { LearningPathsSection } from "@/components/sections/LearningPathsSection";
import { PartnerLogos } from "@/components/sections/PartnerLogos";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <PartnerLogos />
        <CoursesSection />
        <LearningPathsSection />
        <GrowthSection />
        <CtaSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </>
  );
}
