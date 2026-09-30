import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const radii = {
  md: "rounded-2xl", // 16px — floating stat cards
  lg: "rounded-3xl", // 24px — course, category and testimonial cards
};

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-6",
};

type CardProps = ComponentProps<"div"> & {
  radius?: keyof typeof radii;
  padding?: keyof typeof paddings;
  bordered?: boolean;
};

/** White surface used by course, testimonial and floating stat cards. */
export function Card({
  radius = "lg",
  padding = "sm",
  bordered = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-white",
        radii[radius],
        paddings[padding],
        bordered && "border border-neutral-200",
        className,
      )}
      {...props}
    />
  );
}
