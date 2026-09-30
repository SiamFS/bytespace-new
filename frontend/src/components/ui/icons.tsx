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

/** Search (magnifier) — hero search bar (Figma vector). */
export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        transform="translate(3.255 3.255)"
        d="M12.5 11L11.71 11L11.43 10.73C12.41 9.59 13 8.11 13 6.5C13 2.91 10.09 0 6.5 0C2.91 0 0 2.91 0 6.5C0 10.09 2.91 13 6.5 13C8.11 13 9.59 12.41 10.73 11.43L11 11.71L11 12.5L16 17.49L17.49 16L12.5 11ZM6.5 11C4.01 11 2 8.99 2 6.5C2 4.01 4.01 2 6.5 2C8.99 2 11 4.01 11 6.5C11 8.99 8.99 11 6.5 11Z"
      />
    </Icon>
  );
}

/** Filled rounded star — ratings (Figma vector, 16×16 viewBox). */
export function StarIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 16 16" width={16} height={16} {...props}>
      <path d="M7.52482 1.45123C7.67519 0.992014 8.32481 0.992015 8.47518 1.45123L9.69317 5.17111C9.76032 5.37617 9.95144 5.51503 10.1672 5.51552L14.0814 5.5244C14.5646 5.5255 14.7654 6.14333 14.3751 6.42824L11.2137 8.73613C11.0394 8.86335 10.9664 9.08803 11.0326 9.2934L12.2337 13.0188C12.382 13.4787 11.8564 13.8605 11.4648 13.5774L8.29297 11.2838C8.11812 11.1574 7.88188 11.1574 7.70703 11.2838L4.53516 13.5774C4.14359 13.8605 3.61803 13.4787 3.7663 13.0188L4.96741 9.2934C5.03363 9.08803 4.96062 8.86335 4.78634 8.73613L1.62491 6.42824C1.23464 6.14333 1.43538 5.5255 1.91859 5.5244L5.83278 5.51552C6.04856 5.51503 6.23968 5.37617 6.30683 5.17111L7.52482 1.45123Z" />
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
