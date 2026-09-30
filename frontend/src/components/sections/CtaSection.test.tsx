import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CtaSection } from "./CtaSection";

describe("CtaSection", () => {
  it("is a region labelled by its heading", () => {
    render(<CtaSection />);
    expect(
      screen.getByRole("region", { name: "Unlock Your Potential as a Creator with ByteSpace" }),
    ).toBeInTheDocument();
  });

  it("links Join as Creator to the register page", () => {
    render(<CtaSection />);
    expect(screen.getByRole("link", { name: "Join as Creator" })).toHaveAttribute("href", "/register");
  });

  it("renders the 3D shapes as decorative images", () => {
    const { container } = render(<CtaSection />);
    const shapes = container.querySelectorAll("img");
    expect(shapes).toHaveLength(7);
    shapes.forEach((img) => expect(img).toHaveAttribute("alt", ""));
  });
});
