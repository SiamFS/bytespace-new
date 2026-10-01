import type { Metadata } from "next";
import Script from "next/script";
import { Providers } from "@/components/layout/Providers";
import { authStageScaleScript } from "@/lib/authStageScale";
import { poppins, satoshi } from "./fonts";
import "./globals.css";

const description =
  "Unlock your creativity, gain valuable knowledge, and grow your business with our wide range of courses.";

export const metadata: Metadata = {
  title: { default: "ByteSpace", template: "%s | ByteSpace" },
  description,
  applicationName: "ByteSpace",
  openGraph: { type: "website", siteName: "ByteSpace", title: "ByteSpace", description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${satoshi.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
        {/* Fits the desktop login/register frame to short windows (lib/authStageScale.ts). In the
            root layout because `beforeInteractive` only works here (Next.js Script docs). */}
        <Script id="auth-stage-scale" strategy="beforeInteractive">
          {authStageScaleScript}
        </Script>
      </body>
    </html>
  );
}
