import Image from "next/image";
import { Card } from "@/components/ui/Card";
import type { Testimonial } from "@/data/testimonials";
import { cn } from "@/lib/cn";

const nameLeadings = {
  tight: "leading-[1.2]",
  normal: "leading-[1.4]",
};

type TestimonialCardProps = {
  testimonial: Testimonial;
  className?: string;
};

/** White testimonial card (Figma: 374px wide, radius 24, padding 24, 24px gaps, natural height). */
export function TestimonialCard({ testimonial, className }: TestimonialCardProps) {
  const { name, role, quote, avatar, nameLeading } = testimonial;
  return (
    <Card padding="md" className={className}>
      <figure className="flex flex-col gap-6">
        <figcaption className="flex flex-col gap-6">
          <Image src={avatar} alt="" sizes="80px" className="size-20 rounded-full object-cover" />
          <span className="flex flex-col">
            <span className={cn("font-heading text-heading-xs text-black", nameLeadings[nameLeading])}>{name}</span>
            <span className="text-body-m text-primary-800 md:text-body-l">{role}</span>
          </span>
        </figcaption>
        {/* Straight quotes, as in the Figma copy. */}
        <blockquote className="text-body-m text-muted md:text-body-l">
          <p>&quot;{quote}&quot;</p>
        </blockquote>
      </figure>
    </Card>
  );
}
