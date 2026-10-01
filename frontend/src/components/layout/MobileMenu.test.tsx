import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/lib/test-utils";
import { MobileMenu } from "./MobileMenu";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

// Guest session (the menu shows Sign In / Join Us).
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ user: null })));
});

describe("MobileMenu", () => {
  it("starts closed", () => {
    renderWithProviders(<MobileMenu />);
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Courses" })).not.toBeInTheDocument();
  });

  it("opens and closes with the toggle button", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MobileMenu />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Courses" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Sign In" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Close menu" }));
    expect(screen.queryByRole("link", { name: "Courses" })).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MobileMenu />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
  });

  it("closes after a link is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MobileMenu />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("link", { name: "Home" }));
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
  });
});

describe("MobileMenu extras", () => {
  it("shows the cart link next to the menu button", () => {
    renderWithProviders(<MobileMenu />);
    expect(screen.getByRole("link", { name: "Cart" })).toBeInTheDocument();
  });

  it("closes when the dimmed page behind it is tapped", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<MobileMenu />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));

    const backdrop = container.querySelector<HTMLElement>(".fixed.inset-0");
    expect(backdrop).not.toBeNull();
    await user.click(backdrop!);
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
    expect(container.querySelector(".fixed.inset-0")).toBeNull();
  });

  it("locks page scrolling only while open", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MobileMenu />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(document.body.style.overflow).toBe("hidden");
    await user.click(screen.getByRole("button", { name: "Close menu" }));
    expect(document.body.style.overflow).toBe("");
  });
});
