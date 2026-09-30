import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Centers content at the Figma layout width (1200px) with side padding on smaller screens. */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[calc(var(--container-content)+3rem)] px-4 sm:px-6",
        className,
      )}
      {...props}
    />
  );
}
