import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroSearch } from "./HeroSearch";

describe("HeroSearch", () => {
  it("is a search landmark that submits to /courses with GET", () => {
    render(<HeroSearch />);
    const form = screen.getByRole("search");
    expect(form).toHaveAttribute("action", "/courses");
    expect(form).toHaveAttribute("method", "get");
  });

  it("sends the query as ?q=", () => {
    render(<HeroSearch />);
    const input = screen.getByRole("searchbox", { name: "Search courses" });
    expect(input).toHaveAttribute("name", "q");
    expect(input).toHaveAttribute("placeholder", "Course, topic, creator");
  });

  it("has a submit button labelled Search", () => {
    render(<HeroSearch />);
    expect(screen.getByRole("button", { name: "Search" })).toHaveAttribute("type", "submit");
  });
});
