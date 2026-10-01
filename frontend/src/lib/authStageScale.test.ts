import { describe, expect, it } from "vitest";
import { AUTH_MIN_SCALE, authStageScale, authStageScaleScript } from "./authStageScale";

describe("authStageScale", () => {
  it("is exactly 1 (pixel-exact Figma) on windows 1024px or taller", () => {
    expect(authStageScale(1024)).toBe(1);
    expect(authStageScale(1200)).toBe(1);
  });

  it("fits shorter windows", () => {
    expect(authStageScale(900)).toBeCloseTo(900 / 1024);
    expect(authStageScale(768)).toBe(0.75);
  });

  it("stops shrinking at the minimum (the page scrolls instead)", () => {
    expect(authStageScale(500)).toBe(AUTH_MIN_SCALE);
  });

  it("the inline script uses the same numbers", () => {
    expect(authStageScaleScript).toContain(`Math.max(${AUTH_MIN_SCALE}, window.innerHeight / 1024)`);
    expect(authStageScaleScript).toContain('"--auth-scale"');
  });
});
