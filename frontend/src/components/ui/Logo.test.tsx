import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Logo } from "./Logo";

describe("Logo", () => {
  it("has an accessible name", () => {
    render(<Logo />);
    expect(screen.getByRole("img", { name: "ByteSpace" })).toBeInTheDocument();
  });

  it("renders the mark and the wordmark by default", () => {
    render(<Logo />);
    const svg = screen.getByRole("img");
    expect(svg.querySelectorAll("path")).toHaveLength(4);
    expect(svg).toHaveAttribute("width", "171");
  });

  it("renders only the mark when markOnly is set", () => {
    render(<Logo markOnly />);
    const svg = screen.getByRole("img");
    expect(svg.querySelectorAll("path")).toHaveLength(3);
    expect(svg).toHaveAttribute("viewBox", "0 0 30 32");
  });
});
