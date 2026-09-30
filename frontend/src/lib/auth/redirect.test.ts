import { describe, expect, it } from "vitest";
import { safeNext } from "./redirect";

describe("safeNext", () => {
  it.each([
    ["/courses", "/courses"],
    ["/courses?q=figma#top", "/courses?q=figma#top"],
    ["/", "/"],
  ])("keeps same-site path %j", (input, expected) => {
    expect(safeNext(input)).toBe(expected);
  });

  it.each([
    null,
    undefined,
    "",
    "https://evil.example.com",
    "//evil.example.com",
    "/\\evil.example.com",
    "javascript:alert(1)",
    "courses",
    "/login",
    "/register?next=/x",
    "/signup",
  ])("falls back for %j", (input) => {
    expect(safeNext(input)).toBe("/");
  });

  it("keeps paths that only start with an auth word", () => {
    expect(safeNext("/login-help")).toBe("/login-help");
  });
});
