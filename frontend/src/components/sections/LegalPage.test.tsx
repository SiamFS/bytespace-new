import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { privacyPolicy, termsOfService } from "@/data/legal";
import { LegalPage } from "./LegalPage";

describe("LegalPage", () => {
  it("is an article labelled by its title, with every section as a heading", () => {
    render(<LegalPage document={privacyPolicy} />);
    expect(screen.getByRole("article", { name: "Privacy Policy" })).toBeInTheDocument();
    expect(screen.getByText(`Last updated ${privacyPolicy.updated}`)).toBeInTheDocument();
    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(privacyPolicy.sections.map((s) => s.heading));
  });

  it("renders bullet lists and paragraphs", () => {
    render(<LegalPage document={termsOfService} />);
    const account = screen.getByRole("heading", { name: "Your account" }).parentElement!;
    expect(within(account).getAllByRole("listitem")).toHaveLength(3);
  });
});

describe("privacy policy content", () => {
  it("names the cookies the app actually sets", () => {
    const cookies = privacyPolicy.sections.find((s) => s.heading === "Cookies")!.items!.join(" ");
    expect(cookies).toMatch(/^session/);
    expect(cookies).toContain("oauth_google");
  });
});
