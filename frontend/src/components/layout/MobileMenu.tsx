"use client";

import { useEffect, useId, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { mainNav } from "@/data/navigation";
import { AuthNav } from "./AuthNav";
import { NavLinks } from "./NavLinks";

/** Hamburger menu for small screens (our own responsive design — Figma is desktop-only). */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const close = () => setOpen(false);

  // Close with the Escape key.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className="flex size-10 items-center justify-center rounded-full text-neutral-50 focus-visible:outline-2 focus-visible:outline-secondary-400"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

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
