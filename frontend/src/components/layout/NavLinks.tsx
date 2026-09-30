"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import type { NavItem } from "@/data/navigation";

type NavLinksProps = {
  items: NavItem[];
  className?: string;
  /** Called after a link is clicked (the mobile menu closes itself). */
  onNavigate?: () => void;
  /**
   * Link drawn in the active style whatever the route (the Figma 404 frame shows "Home"
   * active). Only the real current page gets aria-current.
   */
  highlightHref?: string;
};

/** Main navigation links. The current page is marked active (Figma: Satoshi Medium vs Regular). */
export function NavLinks({ items, className, onNavigate, highlightHref }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <ul className={className}>
      {items.map((item) => {
        const current = pathname === item.href;
        const active = current || highlightHref === item.href;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              prefetch={item.placeholder ? false : undefined}
              aria-current={current ? "page" : undefined}
              onClick={onNavigate}
              className={cn(
                "rounded-sm text-body-m text-neutral-50 transition-opacity hover:opacity-80",
                "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-400",
                active && "font-medium",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
