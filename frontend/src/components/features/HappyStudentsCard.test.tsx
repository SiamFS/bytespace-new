import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HappyStudentsCard } from "./HappyStudentsCard";

describe("HappyStudentsCard", () => {
  it("shows the title, rating and student count", () => {
    render(<HappyStudentsCard />);
    expect(screen.getByText("Happy Students")).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.getByText(/\(240\)/)).toBeInTheDocument();
    expect(screen.getByText("2K+")).toBeInTheDocument();
  });

  it("hero variant: white card, regular score, lime star and bubble", () => {
    const { container } = render(<HappyStudentsCard />);
    expect(container.firstChild).toHaveClass("bg-white");
    expect(screen.getByText("4.5")).not.toHaveClass("font-bold");
    expect(container.querySelector("svg")).toHaveClass("text-secondary-400");
    expect(screen.getByText("2K+")).toHaveClass("bg-secondary-400");
  });

  it("growth variant: white card with the taller Figma text styles and a bold score", () => {
    const { container } = render(<HappyStudentsCard variant="growth" />);
    expect(container.firstChild).toHaveClass("bg-white");
    expect(screen.getByText("Happy Students")).toHaveClass("leading-normal");
    expect(screen.getByText("4.5")).toHaveClass("font-bold");
    expect(screen.getByText("2K+")).toHaveClass("bg-secondary-400");
  });

  it("auth variant: lime card, blue star, dark bubble", () => {
    const { container } = render(<HappyStudentsCard variant="auth" />);
    expect(container.firstChild).toHaveClass("bg-secondary-400");
    expect(container.querySelector("svg")).toHaveClass("text-primary-800");
    expect(screen.getByText("2K+")).toHaveClass("bg-neutral-950", "text-neutral-50");
  });

  it("renders the seven avatars as decorative images", () => {
    const { container } = render(<HappyStudentsCard />);
    const avatars = container.querySelectorAll("img");
    expect(avatars).toHaveLength(7);
    avatars.forEach((img) => expect(img).toHaveAttribute("alt", ""));
  });
});
