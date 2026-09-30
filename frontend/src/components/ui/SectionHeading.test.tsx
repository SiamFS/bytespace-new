import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionHeading } from "./SectionHeading";

describe("SectionHeading", () => {
  it("renders the title as an h2", () => {
    render(<SectionHeading title="Discover Your Passion" />);
    expect(screen.getByRole("heading", { level: 2, name: "Discover Your Passion" })).toBeInTheDocument();
  });

  it("renders the description only when provided", () => {
    const { rerender } = render(<SectionHeading title="Title" />);
    expect(screen.queryByText("Supporting text")).not.toBeInTheDocument();

    rerender(<SectionHeading title="Title" description="Supporting text" />);
    expect(screen.getByText("Supporting text")).toBeInTheDocument();
  });
});
