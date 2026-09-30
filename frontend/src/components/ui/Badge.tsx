import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const tones = {
  // Frosted pills on course images ("17 Lessons", "2 Hours"): #f6f6f6 @ 60% + 8px backdrop blur
  surface: "bg-surface/60 text-muted backdrop-blur-sm",
  // Level pill in course cards ("Beginner")
  neutral: "bg-neutral-50 text-neutral-700",
};

type BadgeProps = ComponentProps<"span"> & {
  tone?: keyof typeof tones;
};

/** Small non-interactive pill for metadata. */
export function Badge({ tone = "surface", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-3xl px-3 py-1.5 text-label-xs",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
