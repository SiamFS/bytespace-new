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

  it("renders the seven avatars as decorative images", () => {
    const { container } = render(<HappyStudentsCard />);
    const avatars = container.querySelectorAll("img");
    expect(avatars).toHaveLength(7);
    avatars.forEach((img) => expect(img).toHaveAttribute("alt", ""));
  });
});
