import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AvatarGroup } from "./AvatarGroup";

const avatars = [
  { src: "/a.png", alt: "Student A" },
  { src: "/b.png", alt: "Student B" },
];

describe("AvatarGroup", () => {
  it("renders every avatar with its alt text", () => {
    render(<AvatarGroup avatars={avatars} />);
    expect(screen.getByAltText("Student A")).toBeInTheDocument();
    expect(screen.getByAltText("Student B")).toBeInTheDocument();
  });

  it("renders the '+N' bubble when more is set", () => {
    render(<AvatarGroup avatars={avatars} more="2K+" />);
    expect(screen.getByText("2K+")).toBeInTheDocument();
  });

  it("uses the Figma weight per size (bold in hero, medium in cards)", () => {
    const { rerender } = render(<AvatarGroup avatars={[]} more="2K+" size="md" />);
    expect(screen.getByText("2K+")).toHaveClass("font-bold");

    rerender(<AvatarGroup avatars={[]} more="26+" size="sm" />);
    expect(screen.getByText("26+")).toHaveClass("font-medium");
  });
});
