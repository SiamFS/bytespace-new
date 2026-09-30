import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroSection } from "./HeroSection";

describe("HeroSection", () => {
  it("renders the page heading", () => {
    render(<HeroSection />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Get Access to Hundreds Courses Available" }),
    ).toBeInTheDocument();
  });

  it("is labelled by its heading", () => {
    render(<HeroSection />);
    expect(screen.getByRole("region", { name: "Get Access to Hundreds Courses Available" })).toBeInTheDocument();
  });

  it("includes the search form and the stat cards", () => {
    render(<HeroSection />);
    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Learning Progress" })).toBeInTheDocument();
    expect(screen.getByText("UI/UX Design")).toBeInTheDocument();
    expect(screen.getByText("Happy Students")).toBeInTheDocument();
  });

  it("describes the student photo and hides the decorative 3D shapes", () => {
    const { container } = render(<HeroSection />);
    expect(screen.getAllByAltText("Smiling student with headphones holding a laptop").length).toBeGreaterThan(0);
    const decorative = [...container.querySelectorAll("img")].filter((img) => img.getAttribute("alt") === "");
    // 6 shapes + 7 avatars
    expect(decorative).toHaveLength(13);
  });
});
