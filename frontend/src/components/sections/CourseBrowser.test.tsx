import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { categoryRows, courses } from "@/data/courses";
import { CourseBrowser, matchesSearch } from "./CourseBrowser";

// The hero search arrives as ?q= in the URL.
const nav = vi.hoisted(() => ({ search: new URLSearchParams(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: nav.replace }),
  useSearchParams: () => nav.search,
}));
beforeEach(() => {
  nav.search = new URLSearchParams();
  nav.replace.mockReset();
  Element.prototype.scrollIntoView = vi.fn();
});

const cardTitles = () => screen.queryAllByRole("heading", { level: 3 }).map((h) => h.textContent);

describe("CourseBrowser", () => {
  it("renders every category chip from the design, with Featured active", () => {
    render(<CourseBrowser />);
    const group = screen.getByRole("group", { name: "Course categories" });
    const chips = within(group).getAllByRole("button");
    expect(chips).toHaveLength(categoryRows.flat().length);
    expect(within(group).getByRole("button", { name: "Featured" })).toHaveAttribute("aria-pressed", "true");
    expect(within(group).getByRole("link", { name: "+ More" })).toHaveAttribute("href", "/courses");
  });

  it("shows all six courses for Featured", () => {
    render(<CourseBrowser />);
    expect(cardTitles()).toEqual(courses.map((c) => c.title));
    const grid = screen.getByRole("list", { name: "Courses" });
    expect(within(grid).getAllByRole("article")).toHaveLength(6);
  });

  it("on phones, hides cards after the third until 'Show all' is pressed", async () => {
    const user = userEvent.setup();
    render(<CourseBrowser />);
    const items = Array.from(screen.getByRole("list", { name: "Courses" }).children);
    expect(items.map((li) => li.classList.contains("hidden"))).toEqual([false, false, false, true, true, true]);

    await user.click(screen.getByRole("button", { name: "Show all 6 courses" }));
    expect(items.some((li) => li.classList.contains("hidden"))).toBe(false);
    expect(screen.queryByRole("button", { name: "Show all 6 courses" })).not.toBeInTheDocument();
  });

  it("filters the grid when a category is picked", async () => {
    const user = userEvent.setup();
    render(<CourseBrowser />);
    await user.click(screen.getByRole("button", { name: "Freelance & Entrepreneurship" }));

    expect(screen.getByRole("button", { name: "Freelance & Entrepreneurship" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Featured" })).toHaveAttribute("aria-pressed", "false");
    expect(cardTitles()).toEqual(["Mastering Money Management", "From Idea to Startup Success"]);
    expect(screen.getByText("2 courses in Freelance & Entrepreneurship")).toBeInTheDocument();
  });

  it("shows an empty state and can go back to Featured", async () => {
    const user = userEvent.setup();
    render(<CourseBrowser />);
    await user.click(screen.getByRole("button", { name: "Cooking" }));

    expect(cardTitles()).toEqual([]);
    expect(screen.queryByRole("list", { name: "Courses" })).not.toBeInTheDocument();
    expect(screen.getByText("No courses in Cooking yet.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show featured courses" }));
    expect(cardTitles()).toHaveLength(6);
  });

  describe("hero search (?q=)", () => {
    it("filters the grid by title, creator or category and scrolls to it", async () => {
      nav.search = new URLSearchParams("q=design");
      render(<CourseBrowser />);
      expect(await screen.findByText("2 courses for “design”")).toBeInTheDocument();
      expect(cardTitles()).toEqual(["Learn Figma from Basic", "Build Digital Asset"]);
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });

    it("explains when nothing matches, and clears the search", async () => {
      nav.search = new URLSearchParams("q=underwater%20basket");
      const user = userEvent.setup();
      render(<CourseBrowser />);
      expect(await screen.findByText("No courses match “underwater basket”.")).toBeInTheDocument();
      await user.click(screen.getAllByRole("button", { name: "Clear search" })[0]!);
      expect(nav.replace).toHaveBeenCalledWith("/", { scroll: false });
    });

    it("does nothing without a search", () => {
      render(<CourseBrowser />);
      expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
      expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    });
  });
});

describe("matchesSearch", () => {
  it("needs every word, in any order and case", () => {
    const figma = courses[0]!;
    expect(matchesSearch(figma, "FIGMA basic")).toBe(true);
    expect(matchesSearch(figma, "purepearl")).toBe(true);
    expect(matchesSearch(figma, "ui/ux")).toBe(true);
    expect(matchesSearch(figma, "figma cooking")).toBe(false);
  });
});

