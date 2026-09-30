import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { BagIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/Logo";
import { authNav, cartLink, mainNav } from "@/data/navigation";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";

const linkFocus =
  "rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-400";

/**
 * Site header for blue backgrounds (hero, 404). Figma: 120px tall, logo left,
 * Home / Courses / Creators centered, Sign In / Join Us / cart on the right.
 * Transparent and absolutely positioned over the first section, which provides the
 * blue background (it stays outside <main> so it keeps the "banner" landmark role).
 */
export function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <Container className="relative flex h-20 items-center justify-between md:grid md:h-[120px] md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" aria-label="ByteSpace home" className={`justify-self-start text-neutral-50 ${linkFocus}`}>
          <Logo className="h-7 w-auto md:h-[35px]" />
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <NavLinks items={mainNav} className="flex items-center gap-6" />
        </nav>

        <div className="hidden items-center justify-self-end gap-6 md:flex">
          {authNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={item.placeholder ? false : undefined}
              className={`text-body-m leading-normal text-neutral-50 transition-opacity hover:opacity-80 ${linkFocus}`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={cartLink.href}
            prefetch={false}
            aria-label={cartLink.label}
            className={`text-neutral-50 transition-opacity hover:opacity-80 ${linkFocus}`}
          >
            <BagIcon />
          </Link>
        </div>

        <MobileMenu />
      </Container>
    </header>
  );
}
