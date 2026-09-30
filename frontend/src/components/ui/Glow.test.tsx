import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Glow } from "./Glow";

describe("Glow", () => {
  it("is decorative and positioned from Figma coordinates", () => {
    const { container } = render(<Glow color="primary" size={1137} left={722} top={788} opacity={0.24} />);
    const glow = container.firstElementChild as HTMLElement;
    expect(glow).toHaveAttribute("aria-hidden", "true");
    expect(glow.style.left).toBe("722px");
    expect(glow.style.top).toBe("788px");
    expect(glow.style.width).toBe("1137px");
    expect(glow.style.opacity).toBe("0.24");
    expect(glow).toHaveClass("blur-[40px]");
  });
});
