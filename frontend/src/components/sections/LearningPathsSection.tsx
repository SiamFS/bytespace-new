import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { learningPaths } from "@/data/learningPaths";

/**
 * "Explore Diverse Learning Paths at Bytespace" — six category tiles.
 * Figma: 167×167 tiles, 1px neutral-200 border, 24px radius, 40px apart;
 * 60px lime icon circle, Satoshi Medium 20px label.
 */
export function LearningPathsSection() {
  return (
    <section aria-labelledby="learning-paths-title" className="bg-white pt-16 pb-20 lg:pt-[72px] lg:pb-[120px]">
      <Container className="flex flex-col gap-10 lg:gap-[68px]">
        <SectionHeading
          id="learning-paths-title"
          size="s"
          title="Explore Diverse Learning Paths at Bytespace"
          description="At Bytespace, we believe in empowering individuals through knowledge. Our diverse range of courses spans various fields, ensuring there's something for everyone. Unleash your potential and explore our carefully curated categories."
          className="mx-auto max-w-[917px]"
        />
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:flex lg:justify-center lg:gap-10">
          {learningPaths.map(({ label, slug, Icon }) => (
            <li key={slug}>
              <Link
                href={`/courses?category=${slug}`}
                prefetch={false}
                className="flex aspect-square flex-col items-center justify-center gap-3 rounded-3xl border border-neutral-200 bg-white transition-colors hover:border-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 lg:size-[167px]"
              >
                <span className="flex size-[60px] items-center justify-center rounded-full bg-secondary-400 text-neutral-950">
                  <Icon aria-hidden="true" width={36} height={36} />
                </span>
                <span className="text-label-xl text-neutral-950">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
