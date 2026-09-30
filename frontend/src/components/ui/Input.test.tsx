import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("links the label to the input", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInstanceOf(HTMLInputElement);
  });

  it("keeps a hidden label available to screen readers", () => {
    render(<Input label="Search courses" hideLabel placeholder="Course, topic, creator" />);
    expect(screen.getByText("Search courses")).toHaveClass("sr-only");
    expect(screen.getByRole("textbox", { name: "Search courses" })).toBeInTheDocument();
  });

  it("accepts typing", async () => {
    render(<Input label="Email" />);
    const input = screen.getByLabelText("Email");
    await userEvent.type(input, "hi@bytespace.dev");
    expect(input).toHaveValue("hi@bytespace.dev");
  });

  it("hides the decorative icon from assistive tech", () => {
    render(<Input label="Search" icon={<svg data-testid="icon" />} />);
    expect(screen.getByTestId("icon").parentElement).toHaveAttribute("aria-hidden", "true");
  });
});
