import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { categoryRows, courses } from "@/data/courses";
import { CourseBrowser } from "./CourseBrowser";

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
});
