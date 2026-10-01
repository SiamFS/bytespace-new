"use client";

import Link from "next/link";
import { useState } from "react";
import { CourseCard } from "@/components/features/CourseCard";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { categoryRows, courses, FEATURED } from "@/data/courses";
import { cn } from "@/lib/cn";

// Phones show this many cards until "Show all" is pressed (our design — keeps the page short).
const PHONE_LIMIT = 3;

/** Category chips + course grid. Picking a chip filters the grid (with an empty state). */
export function CourseBrowser() {
  const [active, setActive] = useState(FEATURED);
  const [expanded, setExpanded] = useState(false);
  const visible = active === FEATURED ? courses : courses.filter((course) => course.category === active);
  const collapsed = !expanded && visible.length > PHONE_LIMIT;

  return (
    <div className="flex flex-col gap-12 lg:gap-[77px]">
      {/* xl (where the 1200px layout fits) keeps Figma's three rows; tablets wrap freely (rows
          use display: contents); phones get one swipeable row instead of ~11 wrapped rows. */}
      <div
        role="group"
        aria-label="Course categories"
        className={cn(
          "-mx-4 -my-1 flex snap-x scroll-px-4 scrollbar-none gap-x-3 overflow-x-auto px-4 py-1 sm:-mx-6 sm:scroll-px-6 sm:px-6",
          "md:mx-0 md:my-0 md:flex-wrap md:justify-center md:gap-x-4 md:gap-y-[21px] md:overflow-visible md:px-0 md:py-0",
          "xl:flex-col xl:items-center",
        )}
      >
        {categoryRows.map((row, i) => (
          <div key={i} className="contents xl:flex xl:gap-4">
            {row.map((category) => (
              <Chip
                key={category}
                active={category === active}
                onClick={() => setActive(category)}
                className="shrink-0 snap-start whitespace-nowrap"
              >
                {category}
              </Chip>
            ))}
            {i === categoryRows.length - 1 && (
              <Link
                href="/courses"
                prefetch={false}
                className="shrink-0 self-center rounded-sm text-label-m whitespace-nowrap text-primary-800 hover:underline focus-visible:outline-2 focus-visible:outline-primary-600"
              >
                + More
              </Link>
            )}
          </div>
        ))}
      </div>

      <p aria-live="polite" className="sr-only">
        {active === FEATURED
          ? `Showing all ${visible.length} featured courses`
          : `${visible.length} ${visible.length === 1 ? "course" : "courses"} in ${active}`}
      </p>

      {visible.length > 0 ? (
        <div className="flex flex-col items-center gap-8">
          {/* 2 columns until xl: three cards only fit at the full 1200px width (373px each). */}
          <ul id="course-grid" aria-label="Courses" className="grid w-full grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((course, i) => (
              <li key={course.slug} className={cn("min-w-0", collapsed && i >= PHONE_LIMIT && "hidden md:block")}>
                <CourseCard course={course} />
              </li>
            ))}
          </ul>
          {collapsed && (
            <Button
              aria-controls="course-grid"
              aria-expanded={false}
              onClick={() => setExpanded(true)}
              className="md:hidden"
            >
              Show all {visible.length} courses
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-neutral-200 px-6 py-16 text-center">
          <p className="text-body-l text-neutral-700">No courses in {active} yet.</p>
          <button
            type="button"
            onClick={() => setActive(FEATURED)}
            className="rounded-sm text-label-m text-primary-800 hover:underline focus-visible:outline-2 focus-visible:outline-primary-600"
          >
            Show featured courses
          </button>
        </div>
      )}
    </div>
  );
}
