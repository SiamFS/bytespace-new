/**
 * Joins class names, skipping falsy values.
 *
 * Deliberately not tailwind-merge: it treats our custom token utilities
 * (e.g. `text-heading-l` and `text-primary-600`) as conflicting and drops one.
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
