import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CourseBrowser } from "./CourseBrowser";

/** "Discover Your Passion, Build Your Skills" — heading, category chips, 3×2 course grid. */
export function CoursesSection() {
  return (
    <section aria-labelledby="courses-title" className="bg-white pt-16 lg:pt-[72px]">
      <Container className="flex flex-col gap-10 lg:gap-[42px]">
        <SectionHeading
          id="courses-title"
          title="Discover Your Passion, Build Your Skills"
          titleClassName="max-w-[588px]"
          description="At Bytespace Courses, we bring you closer to life-changing knowledge. Explore a variety of courses across different fields, from technology to the arts, and make a difference in your career and life."
          className="mx-auto max-w-[917px]"
        />
        <CourseBrowser />
      </Container>
    </section>
  );
}
