import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { NotFoundSection } from "@/components/sections/NotFoundSection";

/** Root 404 — handles every unmatched URL (Figma frame "404 Not Found"). */
export default function NotFound() {
  return (
    <>
      <Navbar highlightHref="/" />
      <main className="flex-1">
        <NotFoundSection />
      </main>
      <Footer />
    </>
  );
}
