"use client";

import Link from "next/link";
import { authNav } from "@/data/navigation";
import { useLogout, useSession } from "@/lib/auth/useSession";
import { cn } from "@/lib/cn";

const styles = {
  // Desktop navbar: Satoshi 16 / 150%, like Figma's "Sign In" / "Join Us".
  bar: "rounded-sm text-body-m leading-normal text-neutral-50 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-400",
  // Mobile menu panel.
  menu: "text-body-m text-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-400",
};

type AuthNavProps = {
  variant: keyof typeof styles;
  /** Wrap each item in <li> (mobile menu list). */
  asListItems?: boolean;
  /** Called after a link is used (the mobile menu closes itself). */
  onNavigate?: () => void;
};

/**
 * Right side of the navbar. Guests — and the first render, before the session check answers —
 * see Figma's "Sign In" / "Join Us", so the static HTML matches the design. Signed-in users see
 * their first name and "Log out" (our design: Figma has no signed-in state).
 */
export function AuthNav({ variant, asListItems = false, onNavigate }: AuthNavProps) {
  const { user } = useSession();
  const logout = useLogout();
  const className = styles[variant];
  const Item = asListItems ? "li" : "span";
  // In the bar the wrapper is layout-neutral; list items stay real <li>s (display: contents
  // on <li> drops list semantics in some browsers).
  const wrapper = asListItems ? undefined : "contents";

  if (!user) {
    return authNav.map((item) => (
      <Item key={item.href} className={wrapper}>
        <Link href={item.href} onClick={onNavigate} className={className}>
          {item.label}
        </Link>
      </Item>
    ));
  }

  const firstName = user.name.split(/\s+/)[0];
  return (
    <>
      <Item className={cn("text-body-m leading-normal text-neutral-50", asListItems && "block")}>
        <span className="sr-only">Signed in as </span>
        Hi, {firstName}
      </Item>
      <Item className={wrapper}>
        <button
          type="button"
          onClick={() => logout.mutate(undefined, { onSuccess: onNavigate })}
          disabled={logout.isPending}
          className={cn(className, "cursor-pointer text-left disabled:opacity-60")}
        >
          {logout.isPending ? "Logging out…" : "Log out"}
        </button>
      </Item>
    </>
  );
}
