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

/** Grey star next to course ratings (Figma "Style=Outlined" star, 24×24). */
export function StarOutlinedIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 24 24" width={24} height={24} {...props}>
      <path transform="translate(4.12 4.059)" d="M10.3096 5.5525L8.8396 0.7125C8.5496 -0.2375 7.2096 -0.2375 6.9296 0.7125L5.4496 5.5525L0.999597 5.5525C0.0295973 5.5525 -0.370403 6.8025 0.419597 7.3625L4.0596 9.9625L2.6296 14.5725C2.3396 15.5025 3.4196 16.2525 4.1896 15.6625L7.8796 12.8625L11.5696 15.6725C12.3396 16.2625 13.4196 15.5125 13.1296 14.5825L11.6996 9.9725L15.3396 7.3725C16.1296 6.8025 15.7296 5.5625 14.7596 5.5625L10.3096 5.5625L10.3096 5.5525Z" />
    </Icon>
  );
}

/** Sharp lime star — rating on the Growth section's course card (Figma "Style=Outlined" variant, 20×20 in 24×24). */
export function StarSharpIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 24 24" width={24} height={24} {...props}>
      <path transform="translate(2 2)" d="M12.43 8L10 0L7.57 8L0 8L6.18 12.41L3.83 20L10 15.31L16.18 20L13.83 12.41L20 8L12.43 8Z" />
    </Icon>
  );
}

/** Signal bars — course level badge (Figma signal_cellular_alt, 20×20). */
export function LevelIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 20 20" width={20} height={20} {...props}>
      <path transform="translate(3.75 3.333)" d="M10 0L12.5 0L12.5 13.3333L10 13.3333L10 0ZM0 8.33333L2.5 8.33333L2.5 13.3333L0 13.3333L0 8.33333ZM5 4.16667L7.5 4.16667L7.5 13.3333L5 13.3333L5 4.16667Z" />
    </Icon>
  );
}

/** Category: Design (36×36). */
export function DesignIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 36 36" width={36} height={36} {...props}>
      <path transform="translate(4.5 4.5)" d="M19.86 12.7633L22.215 10.4083L16.59 4.78334L14.235 7.13834L8.025 0.943337C6.855 -0.226663 4.95 -0.226663 3.78 0.943337L0.93 3.79334C-0.24 4.96334 -0.24 6.86834 0.93 8.03834L7.125 14.2333L0 21.3733L0 26.9983L5.625 26.9983L12.765 19.8583L18.96 26.0533C20.385 27.4783 22.305 26.9533 23.205 26.0533L26.055 23.2033C27.225 22.0333 27.225 20.1283 26.055 18.9583L19.86 12.7633ZM9.27 12.1033L3.06 5.90834L5.895 3.05834L7.8 4.96334L6.03 6.74834L8.145 8.86334L9.93 7.07834L12.105 9.25334L9.27 12.1033ZM21.09 23.9383L14.895 17.7433L17.745 14.8933L19.92 17.0683L18.135 18.8533L20.25 20.9683L22.035 19.1833L23.94 21.0883L21.09 23.9383Z" />
      <path transform="translate(4.5 4.5)" d="M26.565 6.05834C27.15 5.47334 27.15 4.52834 26.565 3.94334L23.055 0.433337C22.35 -0.271663 21.375 -0.00166329 20.94 0.433337L18.195 3.17834L23.82 8.80334L26.565 6.05834Z" />
      <path transform="translate(4.5 4.5)" d="M26.565 6.05834C27.15 5.47334 27.15 4.52834 26.565 3.94334L23.055 0.433337C22.35 -0.271663 21.375 -0.00166329 20.94 0.433337L18.195 3.17834L23.82 8.80334L26.565 6.05834Z" />
    </Icon>
  );
}

/** Category: Development (36×36). */
export function DevelopmentIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 36 36" width={36} height={36} {...props}>
      <path transform="translate(6 1.5)" d="M4.5 6L19.5 6L19.5 9L22.5 9L22.5 3C22.5 1.35 21.15 0.015 19.5 0.015L4.5 0C2.85 0 1.5 1.35 1.5 3L1.5 9L4.5 9L4.5 6ZM17.115 23.385L24 16.5L17.115 9.615L15 11.745L19.755 16.5L15 21.255L17.115 23.385ZM9 21.255L4.245 16.5L9 11.745L6.885 9.615L0 16.5L6.885 23.385L9 21.255ZM19.5 27L4.5 27L4.5 24L1.5 24L1.5 30C1.5 31.65 2.85 33 4.5 33L19.5 33C21.15 33 22.5 31.65 22.5 30L22.5 24L19.5 24L19.5 27Z" />
    </Icon>
  );
}

/** Category: IT & Software (36×36). */
export function ItSoftwareIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 36 36" width={36} height={36} {...props}>
      <path transform="translate(0 6)" d="M30 21C31.65 21 32.985 19.65 32.985 18L33 3C33 1.35 31.65 0 30 0L6 0C4.35 0 3 1.35 3 3L3 18C3 19.65 4.35 21 6 21L0 21L0 24L36 24L36 21L30 21ZM6 3L30 3L30 18L6 18L6 3Z" />
    </Icon>
  );
}

/** Category: Business (36×36). */
export function BusinessIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 36 36" width={36} height={36} {...props}>
      <path transform="translate(3 4.5)" d="M15 6L15 3C15 1.35 13.65 0 12 0L3 0C1.35 0 0 1.35 0 3L0 24C0 25.65 1.35 27 3 27L27 27C28.65 27 30 25.65 30 24L30 9C30 7.35 28.65 6 27 6L15 6ZM6 24L3 24L3 21L6 21L6 24ZM6 18L3 18L3 15L6 15L6 18ZM6 12L3 12L3 9L6 9L6 12ZM6 6L3 6L3 3L6 3L6 6ZM12 24L9 24L9 21L12 21L12 24ZM12 18L9 18L9 15L12 15L12 18ZM12 12L9 12L9 9L12 9L12 12ZM12 6L9 6L9 3L12 3L12 6ZM25.5 24L15 24L15 21L18 21L18 18L15 18L15 15L18 15L18 12L15 12L15 9L25.5 9C26.325 9 27 9.675 27 10.5L27 22.5C27 23.325 26.325 24 25.5 24ZM24 12L21 12L21 15L24 15L24 12ZM24 18L21 18L21 21L24 21L24 18Z" />
    </Icon>
  );
}

/** Category: Marketing (36×36). */
export function MarketingIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 36 36" width={36} height={36} {...props}>
      <path transform="translate(3 3)" d="M13.5 18L10.5 18C10.5 10.545 16.545 4.5 24 4.5L24 7.5C18.195 7.5 13.5 12.195 13.5 18ZM24 13.5L24 10.5C19.86 10.5 16.5 13.86 16.5 18L19.5 18C19.5 15.51 21.51 13.5 24 13.5ZM7.5 3C7.5 1.335 6.165 0 4.5 0C2.835 0 1.5 1.335 1.5 3C1.5 4.665 2.835 6 4.5 6C6.165 6 7.5 4.665 7.5 3ZM14.175 3.75L11.175 3.75C10.815 5.88 8.985 7.5 6.75 7.5L2.25 7.5C1.005 7.5 0 8.505 0 9.75L0 13.5L9 13.5L9 10.11C11.79 9.225 13.875 6.765 14.175 3.75ZM25.5 22.5C27.165 22.5 28.5 21.165 28.5 19.5C28.5 17.835 27.165 16.5 25.5 16.5C23.835 16.5 22.5 17.835 22.5 19.5C22.5 21.165 23.835 22.5 25.5 22.5ZM27.75 24L23.25 24C21.015 24 19.185 22.38 18.825 20.25L15.825 20.25C16.125 23.265 18.21 25.725 21 26.61L21 30L30 30L30 26.25C30 25.005 28.995 24 27.75 24Z" />
    </Icon>
  );
}

/** Category: Photography (36×36). */
export function PhotographyIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 36 36" width={36} height={36} {...props}>
      <path transform="translate(3 4.5)" d="M27 3L22.245 3L19.5 0L10.5 0L7.755 3L3 3C1.35 3 0 4.35 0 6L0 24C0 25.65 1.35 27 3 27L27 27C28.65 27 30 25.65 30 24L30 6C30 4.35 28.65 3 27 3ZM27 24L3 24L3 6L9.075 6L11.82 3L18.18 3L20.925 6L27 6L27 24Z" />
      <path transform="translate(3 4.5)" d="M15 15C16.6569 15 18 13.6569 18 12C18 10.3431 16.6569 9 15 9C13.3431 9 12 10.3431 12 12C12 13.6569 13.3431 15 15 15Z" />
      <path transform="translate(3 4.5)" d="M19.17 17.37C17.895 16.815 16.485 16.5 15 16.5C13.515 16.5 12.105 16.815 10.83 17.37C9.72 17.85 9 18.93 9 20.145L9 21L21 21L21 20.145C21 18.93 20.28 17.85 19.17 17.37Z" />
    </Icon>
  );
}

/** Filled check circle — Create & Manage list (Figma "Style=Filled" check_circle, 24×24). */
export function CheckCircleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path transform="translate(2 2)" d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" />
    </Icon>
  );
}

/** Facebook — auth social button (Figma vector, 40×40 frame, 33px glyph; the vector is flipped vertically in Figma). */
export function FacebookIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 40 40" width={40} height={40} {...props}>
      <path
        transform="matrix(1 0 0 -1 3.333 36.464)"
        d="M33.3333 16.4642C33.3333 25.6689 25.8714 33.1309 16.6667 33.1309C7.46191 33.1309 0 25.6689 0 16.4642C0 8.14538 6.09476 1.25033 14.0625 0L14.0625 11.6465L9.83073 11.6465L9.83073 16.4642L14.0625 16.4642L14.0625 20.1361C14.0625 24.3132 16.5507 26.6204 20.3577 26.6204C22.1812 26.6204 24.0885 26.2949 24.0885 26.2949L24.0885 22.1934L21.9869 22.1934C19.9165 22.1934 19.2708 20.9086 19.2708 19.5906L19.2708 16.4642L23.8932 16.4642L23.1543 11.6465L19.2708 11.6465L19.2708 0C27.2386 1.25033 33.3333 8.14538 33.3333 16.4642Z"
      />
    </Icon>
  );
}

/** Google — auth social button (Figma vector, 40×40 frame, monochrome as in the design). */
export function GoogleIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 40 40" width={40} height={40} {...props}>
      <g transform="translate(3.333 3.333)">
        <path d="M32.625 17.0417C32.625 15.9444 32.5278 14.9028 32.3611 13.8889L16.6667 13.8889L16.6667 20.1528L25.6528 20.1528C25.25 22.2083 24.0694 23.9444 22.3194 25.125L22.3194 29.2917L27.6806 29.2917C30.8194 26.3889 32.625 22.1111 32.625 17.0417Z" />
        <path d="M16.6667 6.59722C19.125 6.59722 21.3194 7.44445 23.0556 9.09723L27.8056 4.34722C24.9306 1.65278 21.1667 0 16.6667 0C10.1528 0 4.52778 3.75 1.79167 9.19445L7.31945 13.4861C8.63889 9.52778 12.3194 6.59722 16.6667 6.59722Z" />
        <path
          fillRule="evenodd"
          d="M16.6667 33.3333C10.1528 33.3333 4.52778 29.5833 1.79167 24.1389L7.31945 19.8472C8.63889 23.8056 12.3194 26.7361 16.6667 26.7361C18.9167 26.7361 20.8194 26.125 22.3194 25.125L27.6806 29.2917C24.9306 31.8333 21.1667 33.3333 16.6667 33.3333ZM7.31945 13.4861L7.31945 9.19445L1.79167 9.19445L7.31945 13.4861Z"
        />
        <path d="M1.79167 19.8472L7.31945 19.8472C6.97222 18.8472 6.79167 17.7778 6.79167 16.6667C6.79167 15.5556 6.98611 14.4861 7.31945 13.4861L1.79167 9.19445C0.652776 11.4444 0 13.9722 0 16.6667C0 19.3611 0.652776 21.8889 1.79167 24.1389L1.79167 19.8472Z" />
        <path d="M7.31945 19.8472L1.79167 19.8472L1.79167 24.1389L7.31945 19.8472Z" />
      </g>
    </Icon>
  );
}
