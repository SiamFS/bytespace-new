import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { testimonials } from "@/data/testimonials";
import { TestimonialCard } from "./TestimonialCard";

describe("TestimonialCard", () => {
  const [sarah] = testimonials;

  it("shows the name, role and quote", () => {
    render(<TestimonialCard testimonial={sarah} />);
    expect(screen.getByText("Sarah M.")).toBeInTheDocument();
    expect(screen.getByText("Enthusiastic Learner")).toBeInTheDocument();
    expect(screen.getByText(/ByteSpace has transformed my approach to learning/)).toBeInTheDocument();
  });

  it("wraps the quote in a figure with a blockquote", () => {
    const { container } = render(<TestimonialCard testimonial={sarah} />);
    expect(screen.getByRole("figure")).toBeInTheDocument();
    expect(container.querySelector("blockquote")).toHaveTextContent(/^"ByteSpace.*learning\."$/);
  });

  it("renders the avatar as a decorative image (the name is next to it)", () => {
    const { container } = render(<TestimonialCard testimonial={sarah} />);
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });
});
