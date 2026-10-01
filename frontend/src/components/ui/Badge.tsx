import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const tones = {
  // Frosted pills on course images ("17 Lessons", "2 Hours"): #f6f6f6 @ 60% + 8px backdrop blur
  surface: "bg-surface/60 text-muted backdrop-blur-sm",
  // Level pill in course cards ("Beginner")
  neutral: "bg-neutral-50 text-neutral-700",
};

const paddings = {
  default: "px-3",
  // Tighter inside an @container narrower than 340px (course images on phones and
  // tablets); Figma's 12px from there up, so desktop cards stay exact.
  fluid: "px-2 @min-[340px]:px-3",
};

type BadgeProps = ComponentProps<"span"> & {
  tone?: keyof typeof tones;
  padding?: keyof typeof paddings;
};

/** Small non-interactive pill for metadata. Always one line, as in Figma. */
export function Badge({ tone = "surface", padding = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-3xl py-1.5 text-label-xs whitespace-nowrap",
        paddings[padding],
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
