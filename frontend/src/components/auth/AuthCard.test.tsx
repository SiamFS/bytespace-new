import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthCard } from "./AuthCard";
import { SocialSignIn } from "./SocialSignIn";

describe("AuthCard", () => {
  it("is a region labelled by its h1, with the eyebrow and switch link", () => {
    render(
      <AuthCard
        eyebrow="Sign In"
        title="Welcome Back"
        layout="between"
        prompt="New user?"
        promptTone="hint"
        switchLink={{ label: "Create an account", href: "/register" }}
      >
        <form aria-label="login" />
      </AuthCard>,
    );
    expect(screen.getByRole("region", { name: "Welcome Back" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Welcome Back" })).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toHaveClass("text-primary-800");
    expect(screen.getByText("New user?")).toHaveClass("text-hint");
    expect(screen.getByRole("link", { name: "Create an account" })).toHaveAttribute("href", "/register");
  });

  it("uses Register's grey and gap layout", () => {
    const { container } = render(
      <AuthCard
        eyebrow="Create an Account"
        title="Welcome to ByteSpace"
        layout="gap"
        prompt="Already have an account?"
        promptTone="muted"
        switchLink={{ label: "Login", href: "/login" }}
      >
        <form aria-label="register" />
      </AuthCard>,
    );
    expect(screen.getByText("Already have an account?")).toHaveClass("text-neutral-700");
    expect(container.querySelector("section > div")).toHaveClass("xl:gap-[122px]");
  });
});

describe("SocialSignIn", () => {
  it("renders named placeholder links for Facebook and Google", () => {
    render(<SocialSignIn />);
    expect(screen.getByRole("link", { name: "Continue with Facebook" })).toHaveAttribute("href", "/auth/facebook");
    expect(screen.getByRole("link", { name: "Continue with Google" })).toHaveAttribute("href", "/auth/google");
    expect(screen.getByRole("separator", { name: "or" })).toBeInTheDocument();
  });
});
