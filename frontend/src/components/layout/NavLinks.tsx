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
};

/** Main navigation links. The current page is marked active (Figma: Satoshi Medium vs Regular). */
export function NavLinks({ items, className, onNavigate }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <ul className={className}>
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              prefetch={item.placeholder ? false : undefined}
              aria-current={active ? "page" : undefined}
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
