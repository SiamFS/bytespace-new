import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { footerColumns, legalLinks } from "@/data/navigation";
import { NewsletterForm } from "./NewsletterForm";

const linkClass =
  "rounded-sm text-neutral-950 transition-colors hover:text-primary-600 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600";

/**
 * Site footer. Figma: white, 1200px content, newsletter on the left, three link
 * columns on the right, divider + copyright row at the bottom.
 */
export function Footer() {
  return (
    <footer className="bg-white pt-16 pb-12 lg:pt-[71px]">
      <Container className="flex flex-col gap-16 lg:gap-[130px]">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-[92px]">
          <div className="flex max-w-[528px] flex-col gap-[45px]">
            {/* 18px: Figma measures 16px from the 37px logo group; the SVG itself is 35px. */}
            <div className="flex flex-col gap-[18px]">
              <Link href="/" aria-label="ByteSpace home" className="w-fit rounded-sm text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
                <Logo />
              </Link>
              <p className="text-body-s text-neutral-950">
                Stay Up to date with our latest features and releases by joining our newsletter.
              </p>
            </div>
            <NewsletterForm />
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:flex">
            {footerColumns.map((column) => (
              <div key={column.title} className="lg:w-[167px]">
                {/* Invisible in Figma (no fill) — kept for screen readers. */}
                <h2 className="sr-only">{column.title}</h2>
                <ul className="flex flex-col gap-4 text-body-s lg:pt-12">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        prefetch={link.placeholder ? false : undefined}
                        className={linkClass}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-6 border-t border-neutral-200 pt-6">
          <div className="flex flex-col gap-4 text-body-xs sm:flex-row sm:items-center sm:justify-between">
            <p className="text-neutral-950">@ 2023 ByteSpace. All rights reserved.</p>
            <ul className="flex flex-wrap gap-6">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} prefetch={false} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
}
