import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SocialSignIn } from "./SocialSignIn";

describe("SocialSignIn", () => {
  it("starts Google sign-in at the API with a full page navigation", () => {
    render(<SocialSignIn />);
    const google = screen.getByRole("link", { name: "Continue with Google" });
    expect(google).toHaveAttribute("href", "/api/auth/google");
  });

  it("keeps Facebook as a placeholder link", () => {
    render(<SocialSignIn />);
    expect(screen.getByRole("link", { name: "Continue with Facebook" })).toHaveAttribute("href", "/auth/facebook");
  });

  it("separates the buttons from the form with an 'or' divider", () => {
    render(<SocialSignIn />);
    expect(screen.getByRole("separator", { name: "or" })).toBeInTheDocument();
  });
});
