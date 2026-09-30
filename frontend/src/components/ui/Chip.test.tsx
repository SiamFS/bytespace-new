import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Chip } from "./Chip";

describe("Chip", () => {
  it("exposes the active state to assistive tech via aria-pressed", () => {
    render(
      <>
        <Chip active>Featured</Chip>
        <Chip>Music</Chip>
      </>,
    );
    expect(screen.getByRole("button", { name: "Featured" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Music" })).toHaveAttribute("aria-pressed", "false");
  });

  it("uses the lime style only when active", () => {
    render(
      <>
        <Chip active>Featured</Chip>
        <Chip>Music</Chip>
      </>,
    );
    expect(screen.getByRole("button", { name: "Featured" })).toHaveClass("bg-secondary-400");
    expect(screen.getByRole("button", { name: "Music" })).toHaveClass("bg-neutral-50");
  });
});
