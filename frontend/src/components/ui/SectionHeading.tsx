import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const sizes = {
  m: "text-heading-m-mobile md:text-heading-m", // 44px on desktop
  s: "text-heading-s-mobile md:text-heading-s", // 36px on desktop
};

const tones = {
  dark: { title: "text-ink", description: "text-neutral-400" },
  light: { title: "text-neutral-50", description: "text-neutral-50" },
};

type SectionHeadingProps = {
  title: ReactNode;
  description?: ReactNode;
  size?: keyof typeof sizes;
  tone?: keyof typeof tones;
  align?: "center" | "left";
  className?: string;
};

/** Section title (h2) with an optional supporting paragraph. */
export function SectionHeading({
  title,
  description,
  size = "m",
  tone = "dark",
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      <h2 className={cn("font-heading", sizes[size], tones[tone].title)}>{title}</h2>
      {description && (
        <p className={cn("text-body-m md:text-body-l", tones[tone].description)}>
          {description}
        </p>
      )}
    </div>
  );
}
