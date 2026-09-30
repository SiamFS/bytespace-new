import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressCard } from "./ProgressCard";

describe("ProgressCard", () => {
  it("shows the label and the percentage", () => {
    render(<ProgressCard label="Learning Progress" value={55} />);
    expect(screen.getByText("Learning Progress")).toBeInTheDocument();
    expect(screen.getByText("55%")).toBeInTheDocument();
  });

  it("exposes an accessible progress bar", () => {
    render(<ProgressCard label="Learning Progress" value={55} />);
    const bar = screen.getByRole("progressbar", { name: "Learning Progress" });
    expect(bar).toHaveAttribute("aria-valuenow", "55");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("fills the bar to the given value", () => {
    render(<ProgressCard label="Learning Progress" value={55} />);
    const fill = screen.getByRole("progressbar").firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("55%");
  });
});
