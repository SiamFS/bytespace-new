import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestimonialsSection } from "./TestimonialsSection";

describe("TestimonialsSection", () => {
  it("is a region labelled by its heading", () => {
    render(<TestimonialsSection />);
    expect(screen.getByRole("region", { name: "Discover What Our Community Is Saying" })).toBeInTheDocument();
  });

  it("lists the three testimonials in Figma order", () => {
    render(<TestimonialsSection />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items.map((item) => within(item).getByRole("figure").querySelector("figcaption")?.textContent)).toEqual([
      "Sarah M.Enthusiastic Learner",
      "James L.Lifelong Learner",
      "Alex B.Inspired Creator",
    ]);
  });
});
