import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

// Two input styles in the Figma file. Kept as variants (not className overrides)
// because without tailwind-merge, conflicting utilities can't be overridden reliably.
const variants = {
  // Hero search bar: white pill, 12/24 padding, 24px radius, Satoshi 18, grey placeholder.
  search: {
    wrapper: "rounded-3xl px-6 py-3",
    input: "text-body-l placeholder:text-neutral-400",
  },
  // Footer newsletter: fully rounded, 1px neutral-200 border, fixed 52px height, 24px side padding, Satoshi 16, dark placeholder.
  outline: {
    wrapper: "h-[52px] rounded-full border border-neutral-200 px-6",
    input: "text-body-m placeholder:text-neutral-950",
  },
};

type InputProps = ComponentProps<"input"> & {
  label: string;
  /** Keep the label for screen readers but hide it visually (e.g. the hero search bar). */
  hideLabel?: boolean;
  icon?: ReactNode;
  variant?: keyof typeof variants;
  /** Class names for the outer wrapper (layout only, e.g. width). */
  wrapperClassName?: string;
};

/** Text input in the Figma pill style, with an optional leading icon. */
export function Input({
  label,
  hideLabel = false,
  icon,
  variant = "search",
  wrapperClassName,
  className,
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const v = variants[variant];

  return (
    <div className={cn("flex flex-col gap-2", wrapperClassName)}>
      <label
        htmlFor={inputId}
        className={cn("text-label-s text-neutral-700", hideLabel && "sr-only")}
      >
        {label}
      </label>
      <div
        className={cn(
          "flex items-center gap-2 bg-white",
          "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-600",
          v.wrapper,
        )}
      >
        {icon && (
          <span aria-hidden="true" className="flex shrink-0 text-neutral-400">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            "w-full min-w-0 bg-transparent text-neutral-950 outline-none",
            v.input,
            className,
          )}
          {...props}
        />
      </div>
    </div>
  );
}
