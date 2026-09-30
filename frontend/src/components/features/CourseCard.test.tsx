import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { courses } from "@/data/courses";
import { CourseCard } from "./CourseCard";

const course = courses[0];

describe("CourseCard", () => {
  it("renders the title as a link to the course page", () => {
    render(<CourseCard course={course} />);
    const link = screen.getByRole("link", { name: "Learn Figma from Basic" });
    expect(link).toHaveAttribute("href", "/courses/learn-figma-from-basic");
    expect(screen.getByRole("heading", { level: 3 })).toHaveClass("truncate");
  });

  it("shows the author, meta badges, level and price", () => {
    render(<CourseCard course={course} />);
    expect(screen.getByText("purepearl studio")).toHaveClass("text-primary-800");
    expect(screen.getByText("17 Lessons")).toBeInTheDocument();
    expect(screen.getByText("2 hours 16 mins")).toBeInTheDocument();
    expect(screen.getByText("59 Comments")).toBeInTheDocument();
    expect(screen.getByText("Beginner")).toBeInTheDocument();
    expect(screen.getByText("$25")).toBeInTheDocument();
    expect(screen.getByText("/lifetime")).toBeInTheDocument();
    expect(screen.getByText("26+")).toBeInTheDocument();
  });

  it("reads the rating with context for screen readers", () => {
    render(<CourseCard course={course} />);
    expect(screen.getByText("out of 5")).toHaveClass("sr-only");
    expect(screen.getByText(/4\.5/)).toBeInTheDocument();
  });

  it("growth variant uses the Growth section styles (taller lines, dark bubble)", () => {
    render(<CourseCard course={course} variant="growth" />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveClass("leading-[1.4]");
    expect(screen.getByText("17 Lessons")).toHaveClass("leading-5");
    expect(screen.getByText("26+")).toHaveClass("bg-black", "text-white");
  });

  it("default variant keeps the lime bubble", () => {
    render(<CourseCard course={course} />);
    expect(screen.getByText("26+")).toHaveClass("bg-secondary-400");
  });
});
