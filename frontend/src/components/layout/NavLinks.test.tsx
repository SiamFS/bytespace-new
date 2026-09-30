import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mainNav } from "@/data/navigation";
import { NavLinks } from "./NavLinks";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

describe("NavLinks", () => {
  beforeEach(() => {
    pathname.current = "/";
  });

  it("renders every main navigation link", () => {
    render(<NavLinks items={mainNav} />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Courses" })).toHaveAttribute("href", "/courses");
    expect(screen.getByRole("link", { name: "Creators" })).toHaveAttribute("href", "/creators");
  });

  it("marks the current page with aria-current and the medium weight", () => {
    render(<NavLinks items={mainNav} />);
    const home = screen.getByRole("link", { name: "Home" });
    expect(home).toHaveAttribute("aria-current", "page");
    expect(home).toHaveClass("font-medium");
    expect(screen.getByRole("link", { name: "Courses" })).not.toHaveAttribute("aria-current");
  });

  it("draws highlightHref as active without claiming aria-current", () => {
    pathname.current = "/missing-page";
    render(<NavLinks items={mainNav} highlightHref="/" />);
    const home = screen.getByRole("link", { name: "Home" });
    expect(home).toHaveClass("font-medium");
    expect(home).not.toHaveAttribute("aria-current");
  });

  it("follows the current route", () => {
    pathname.current = "/courses";
    render(<NavLinks items={mainNav} />);
    expect(screen.getByRole("link", { name: "Courses" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
  });
});
