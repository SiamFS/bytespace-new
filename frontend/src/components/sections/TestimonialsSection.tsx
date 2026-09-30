import { TestimonialCard } from "@/components/features/TestimonialCard";
import { Container } from "@/components/ui/Container";
import { Glow } from "@/components/ui/Glow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/data/testimonials";

/**
 * "Discover What Our Community Is Saying" (Figma Testimonials_Frame: #fafafa with soft
 * lime/blue glows). Figma's content is 1204px wide at x118, 2px wider than our 1200px
 * container on each side — the -mx-[2px] on lg puts it on the exact coordinates.
 */
export function TestimonialsSection() {
  return (
    <section
      aria-labelledby="testimonials-title"
      className="relative isolate overflow-hidden bg-canvas py-20 lg:pt-[74px] lg:pb-[57px]"
    >
      {/* Glows at Figma coordinates (relative to the section's 1440px frame). */}
      <div aria-hidden="true" className="absolute inset-y-0 left-1/2 -z-10 w-[1440px] -translate-x-1/2">
        <Glow color="secondary" size={1137} left={842} top={-241} opacity={0.4} />
        <Glow color="secondary" size={672} left={395} top={-138} opacity={0.6} />
        <Glow color="primary" size={1137} left={-442} top={149} opacity={0.24} />
      </div>

      <Container>
        <div className="flex flex-col gap-12 lg:-mx-[2px] lg:gap-[72px]">
          {/* Heading + intro side by side, bottom-aligned (Figma row, gap 43). */}
          <div className="flex flex-col gap-6 lg:w-[1200px] lg:flex-row lg:items-end lg:gap-[43px]">
            <SectionHeading
              id="testimonials-title"
              align="left"
              tone="black"
              title="Discover What Our Community Is Saying"
              className="lg:w-[577px] lg:shrink-0"
            />
            <p className="text-body-m text-muted md:text-body-l lg:w-[580px]">
              At ByteSpace, our vibrant community of learners and creators is at the heart of what we do. Hear
              directly from those who have experienced the transformative journey of learning and creating on our
              platform. Explore testimonials that reflect the diverse perspectives of enthusiastic learners and
              accomplished creators.
            </p>
          </div>

          {/* Cards keep their natural heights (432 / 436 / 407 in Figma) — no stretching. */}
          <ul className="grid grid-cols-1 items-start gap-6 md:grid-cols-3 lg:grid-cols-[repeat(3,374px)] lg:gap-[41px]">
            {testimonials.map((testimonial) => (
              <li key={testimonial.name} className="min-w-0">
                <TestimonialCard testimonial={testimonial} />
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
