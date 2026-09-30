import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

// Figma: lime pill, 12px/24px padding, 24px radius, Satoshi Medium 18px ("Search", "Join as Creator").
const base =
  "inline-flex items-center justify-center gap-2 rounded-3xl px-6 py-3 text-label-l transition-colors " +
  "bg-secondary-400 text-neutral-950 hover:bg-secondary-300 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 " +
  "disabled:pointer-events-none disabled:opacity-50";

type ButtonProps = ComponentProps<"button">;
type LinkButtonProps = ComponentProps<typeof Link>;

/** Primary call-to-action button. Pass `href` to render a link styled as a button. */
export function Button(props: ButtonProps | LinkButtonProps) {
  if ("href" in props && props.href !== undefined) {
    const { className, ...rest } = props;
    return <Link className={cn(base, className)} {...rest} />;
  }

  const { className, type = "button", ...rest } = props as ButtonProps;
  return <button type={type} className={cn(base, className)} {...rest} />;
}
