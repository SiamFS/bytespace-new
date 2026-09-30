import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type InputProps = ComponentProps<"input"> & {
  label: string;
  /** Keep the label for screen readers but hide it visually (e.g. the hero search bar). */
  hideLabel?: boolean;
  icon?: ReactNode;
  /** Class names for the pill wrapper. */
  wrapperClassName?: string;
};

/** Text input in the Figma pill style: white, 24px radius, optional leading icon. */
export function Input({
  label,
  hideLabel = false,
  icon,
  wrapperClassName,
  className,
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className={cn("text-label-s text-neutral-700", hideLabel && "sr-only")}
      >
        {label}
      </label>
      <div
        className={cn(
          "flex items-center gap-2 rounded-3xl bg-white px-6 py-3",
          "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-600",
          wrapperClassName,
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
            "w-full min-w-0 bg-transparent text-body-l text-neutral-950 outline-none placeholder:text-neutral-400",
            className,
          )}
          {...props}
        />
      </div>
    </div>
  );
}
