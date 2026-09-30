import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NotFoundSection } from "./NotFoundSection";

describe("NotFoundSection", () => {
  it("is a region labelled by its heading", () => {
    render(<NotFoundSection />);
    expect(
      screen.getByRole("region", { name: "The page you are looking for doesn’t exist" }),
    ).toBeInTheDocument();
  });

  it("shows the 404 code with the gradient fill", () => {
    render(<NotFoundSection />);
    expect(screen.getByText("404")).toHaveClass("text-gradient-404");
  });

  it("links Back to Home to the home page", () => {
    render(<NotFoundSection />);
    expect(screen.getByRole("link", { name: "Back to Home" })).toHaveAttribute("href", "/");
  });
});
