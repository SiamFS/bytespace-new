"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { BagIcon, CloseIcon, MenuIcon } from "@/components/ui/icons";
import { cartLink, mainNav } from "@/data/navigation";
import { AuthNav } from "./AuthNav";
import { NavLinks } from "./NavLinks";

const iconButton =
  "relative z-30 flex size-10 items-center justify-center rounded-full text-neutral-50 " +
  "focus-visible:outline-2 focus-visible:outline-secondary-400";

/**
 * Cart + hamburger menu for small screens (our own responsive design — Figma is desktop-only).
 * The open panel dims the page behind it; a tap outside, Escape or a link closes it.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const close = () => setOpen(false);

  // While open: close with Escape and stop the page behind from scrolling.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="flex items-center gap-1 md:hidden">
      <Link href={cartLink.href} prefetch={false} aria-label={cartLink.label} className={iconButton}>
        <BagIcon />
      </Link>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className={iconButton}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open && (
        <div aria-hidden="true" onClick={close} className="fixed inset-0 z-10 bg-black/50" />
      )}

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-4 top-full z-20 rounded-2xl bg-primary-900 p-6 shadow-lg"
      >
        <nav aria-label="Mobile">
          <NavLinks items={mainNav} onNavigate={close} className="flex flex-col gap-4" />
          <ul className="mt-6 flex flex-col gap-3 border-t border-white/20 pt-6">
            <AuthNav variant="menu" asListItems onNavigate={close} />
          </ul>
        </nav>
      </div>
    </div>
  );
}
