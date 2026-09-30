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

describe("Input variants", () => {
  it("uses the search pill by default", () => {
    render(<Input label="Search" />);
    const wrapper = screen.getByLabelText("Search").parentElement;
    expect(wrapper).toHaveClass("rounded-3xl", "py-3");
    expect(screen.getByLabelText("Search")).toHaveClass("text-body-l", "placeholder:text-neutral-400");
  });

  it("uses the bordered, fully rounded style for the outline variant", () => {
    render(<Input label="Email" variant="outline" />);
    const wrapper = screen.getByLabelText("Email").parentElement;
    expect(wrapper).toHaveClass("rounded-full", "border", "border-neutral-200");
    expect(wrapper).not.toHaveClass("rounded-3xl");
    expect(screen.getByLabelText("Email")).toHaveClass("text-body-m", "placeholder:text-neutral-950");
  });
});
