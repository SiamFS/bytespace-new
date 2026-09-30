import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GrowthSection } from "./GrowthSection";

describe("GrowthSection", () => {
  it("is a region labelled by its first heading and has both headings", () => {
    render(<GrowthSection />);
    const region = screen.getByRole("region", { name: "Your Path to Professional Growth Starts Here!" });
    expect(within(region).getByRole("heading", { name: "Create & Manage Courses Easily." })).toBeInTheDocument();
  });

  it("lists the three stats as term/value pairs", () => {
    render(<GrowthSection />);
    const terms = screen.getAllByRole("term").map((el) => el.textContent);
    const values = screen.getAllByRole("definition").map((el) => el.textContent);
    expect(terms).toEqual(["Students", "Courses", "Creators"]);
    expect(values).toEqual(["12K", "70+", "16"]);
  });

  it("lists the four creator perks", () => {
    render(<GrowthSection />);
    for (const perk of ["Share Your Expertise", "Monetize Your Passion", "Flexibility and Autonomy", "Build a Community"]) {
      expect(screen.getByText(perk)).toBeInTheDocument();
    }
  });

  it("highlights ByteSpace in the description", () => {
    render(<GrowthSection />);
    expect(screen.getByText("ByteSpace", { selector: "strong" })).toBeInTheDocument();
  });

  it("shows the revenue stat cards", () => {
    render(<GrowthSection />);
    expect(screen.getByText("$120.29")).toBeInTheDocument();
    expect(screen.getByText("$1,200.38")).toBeInTheDocument();
    expect(screen.getAllByText("+12$")).toHaveLength(2);
  });
});
