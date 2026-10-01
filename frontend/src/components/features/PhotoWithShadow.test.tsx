import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import student from "@/assets/photos/student.png";
import { PhotoWithShadow } from "./PhotoWithShadow";

describe("PhotoWithShadow", () => {
  it("renders the photo with its alt text and the box classes on the wrapper", () => {
    render(<PhotoWithShadow shadow="student" src={student} alt="Smiling student" sizes="578px" className="box" />);
    const photo = screen.getByRole("img", { name: "Smiling student" });
    expect(photo.parentElement).toHaveClass("box");
  });

  it("adds the shadow as a decorative image, placed in % so it scales with the photo", () => {
    const { container } = render(<PhotoWithShadow shadow="student" src={student} alt="Smiling student" sizes="578px" />);
    const shadow = container.querySelector('img[aria-hidden="true"]') as HTMLImageElement;
    expect(shadow).toHaveAttribute("alt", "");
    // Padding 60/40/160/184 px around a 578×541 photo.
    expect(shadow.style.left).toBe(`${(-60 / 578) * 100}%`);
    expect(shadow.style.top).toBe(`${(-40 / 541) * 100}%`);
    expect(shadow.style.width).toBe(`${(798 / 578) * 100}%`);
    expect(shadow.style.height).toBe(`${(765 / 541) * 100}%`);
    // Only the photo is exposed to assistive technology.
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });
});
