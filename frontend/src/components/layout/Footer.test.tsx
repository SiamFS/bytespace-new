import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { footerColumns } from "@/data/navigation";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("renders every link column with a screen-reader heading", () => {
    render(<Footer />);
    const nav = screen.getByRole("navigation", { name: "Footer" });
    for (const column of footerColumns) {
      expect(within(nav).getByRole("heading", { name: column.title })).toHaveClass("sr-only");
      for (const link of column.links) {
        expect(within(nav).getByRole("link", { name: link.label })).toBeInTheDocument();
      }
    }
  });

  it("shows the copyright and legal links", () => {
    render(<Footer />);
    expect(screen.getByText("@ 2023 ByteSpace. All rights reserved.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Terms of Service" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cookies Settings" })).toBeInTheDocument();
  });

  it("has a required email field in the newsletter form", () => {
    render(<Footer />);
    const email = screen.getByRole("textbox", { name: "Email address" });
    expect(email).toHaveAttribute("type", "email");
    expect(email).toBeRequired();
    expect(email).toHaveAttribute("placeholder", "Enter your email");
  });

  it("confirms the subscription after submitting a valid email", async () => {
    const user = userEvent.setup();
    render(<Footer />);
    await user.type(screen.getByRole("textbox", { name: "Email address" }), "student@bytespace.dev");
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(screen.getByRole("status")).toHaveTextContent("Thanks for subscribing!");
    expect(screen.getByRole("textbox", { name: "Email address" })).toHaveValue("");
  });
});
