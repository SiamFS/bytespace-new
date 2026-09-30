import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

// Input styles in the Figma file. Kept as variants (not className overrides)
// because without tailwind-merge, conflicting utilities can't be overridden reliably.
const variants = {
  // Hero search bar: white pill, 12/24 padding, 24px radius, Satoshi 18, grey placeholder.
  search: {
    label: "text-label-s text-neutral-700",
    wrapper: "rounded-3xl px-6 py-3",
    border: "",
    input: "text-body-l placeholder:text-neutral-400",
  },
  // Footer newsletter: fully rounded, 1px neutral-200 border, fixed 52px height, 24px side padding, Satoshi 16, dark placeholder.
  outline: {
    label: "text-label-s text-neutral-700",
    wrapper: "h-[52px] rounded-full border px-6",
    border: "border-neutral-200",
    input: "text-body-m placeholder:text-neutral-950",
  },
  // Login / Register fields: 52px tall, 12px radius, 1px neutral-100 stroke *inside* the box
  // (so 23px + 1px border = Figma's 24px padding), Satoshi 18, grey placeholder; dark 14px label.
  field: {
    label: "text-label-s text-neutral-950",
    wrapper: "h-[52px] rounded-xl border px-[23px]",
    border: "border-neutral-100",
    input: "text-body-l placeholder:text-neutral-400",
  },
};

type InputProps = ComponentProps<"input"> & {
  label: string;
  /** Keep the label for screen readers but hide it visually (e.g. the hero search bar). */
  hideLabel?: boolean;
  icon?: ReactNode;
  variant?: keyof typeof variants;
  /** Validation message shown under the input (our design — Figma has no error states). */
  error?: string;
  /** Class names for the outer wrapper (layout only, e.g. width). */
  wrapperClassName?: string;
};

/** Labelled text input in one of the Figma styles, with an optional leading icon and error message. */
export function Input({
  label,
  hideLabel = false,
  icon,
  variant = "search",
  error,
  wrapperClassName,
  className,
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const v = variants[variant];

  return (
    <div className={cn("flex flex-col gap-2", wrapperClassName)}>
      <label htmlFor={inputId} className={cn(v.label, hideLabel && "sr-only")}>
        {label}
      </label>
      <div
        className={cn(
          "flex items-center gap-2 bg-white",
          "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-600",
          v.wrapper,
          // One border colour at a time (no tailwind-merge): the error red replaces the variant colour.
          error ? "border-danger" : v.border,
        )}
      >
        {icon && (
          <span aria-hidden="true" className="flex shrink-0 text-neutral-400">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "w-full min-w-0 bg-transparent text-neutral-950 outline-none",
            // Keep autofilled fields white instead of the browser's yellow/blue tint.
            "autofill:shadow-[inset_0_0_0_1000px_var(--color-white)] autofill:[-webkit-text-fill-color:var(--color-neutral-950)]",
            v.input,
            className,
          )}
          {...props}
        />
      </div>
      {error && (
        <p id={errorId} className="text-body-s text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
