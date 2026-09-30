import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders a button with type='button' by default", () => {
    render(<Button>Search</Button>);
    const button = screen.getByRole("button", { name: "Search" });
    expect(button).toHaveAttribute("type", "button");
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Search</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders a link when href is passed", () => {
    render(<Button href="/register">Join as Creator</Button>);
    const link = screen.getByRole("link", { name: "Join as Creator" });
    expect(link).toHaveAttribute("href", "/register");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("merges a custom className", () => {
    render(<Button className="w-full">Search</Button>);
    expect(screen.getByRole("button")).toHaveClass("w-full", "bg-secondary-400");
  });
});
