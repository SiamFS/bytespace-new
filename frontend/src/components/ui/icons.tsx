import type { ComponentProps } from "react";

// Material Symbols icons (the style used in the Figma file), 24×24, `currentColor`.
// Decorative by default — give the parent control an accessible name.

type IconProps = ComponentProps<"svg">;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Shopping bag — navbar cart (exported from Figma). */
export function BagIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M18 6H16C16 3.79 14.21 2 12 2C9.79 2 8 3.79 8 6H6C4.9 6 4 6.9 4 8V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8C20 6.9 19.1 6 18 6ZM12 4C13.1 4 14 4.9 14 6H10C10 4.9 10.9 4 12 4ZM18 20H6V8H8V10C8 10.55 8.45 11 9 11C9.55 11 10 10.55 10 10V8H14V10C14 10.55 14.45 11 15 11C15.55 11 16 10.55 16 10V8H18V20Z" />
    </Icon>
  );
}

/** Hamburger — mobile menu (not in Figma; our responsive design). */
export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    </Icon>
  );
}

/** Close — mobile menu (not in Figma; our responsive design). */
export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </Icon>
  );
}
