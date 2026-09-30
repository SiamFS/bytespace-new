import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { learningPaths } from "@/data/learningPaths";
import { LearningPathsSection } from "./LearningPathsSection";

describe("LearningPathsSection", () => {
  it("is a region labelled by its heading", () => {
    render(<LearningPathsSection />);
    expect(
      screen.getByRole("region", { name: "Explore Diverse Learning Paths at Bytespace" }),
    ).toBeInTheDocument();
  });

  it("links every tile to its category", () => {
    render(<LearningPathsSection />);
    for (const path of learningPaths) {
      expect(screen.getByRole("link", { name: path.label })).toHaveAttribute(
        "href",
        `/courses?category=${path.slug}`,
      );
    }
  });
});
