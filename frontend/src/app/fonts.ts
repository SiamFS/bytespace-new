import { Poppins } from "next/font/google";
import localFont from "next/font/local";

// Headings — Poppins is not a variable font, so load only the weights the design uses.
export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

// Body and labels — Satoshi variable font (fetched by scripts/fetch-fonts.mjs).
export const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.woff2",
  weight: "300 900",
  variable: "--font-satoshi",
  display: "swap",
});
