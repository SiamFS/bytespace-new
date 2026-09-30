import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type ChipProps = ComponentProps<"button"> & {
  active?: boolean;
};

/** Selectable category pill ("Featured", "Music", …). Active = lime, inactive = light grey. */
export function Chip({ active = false, className, type = "button", ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center justify-center rounded-3xl px-4 py-3 text-label-m transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
        active
          ? "bg-secondary-400 text-neutral-950"
          : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100",
        className,
      )}
      {...props}
    />
  );
}
