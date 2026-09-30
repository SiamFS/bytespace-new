import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins class names with a space", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("skips falsy values", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("keeps token classes that tailwind-merge would treat as conflicts", () => {
    expect(cn("text-heading-l", "text-primary-600")).toBe("text-heading-l text-primary-600");
  });
});
