"use client";

import Link from "next/link";
import { useState } from "react";
import { CourseCard } from "@/components/features/CourseCard";
import { Chip } from "@/components/ui/Chip";
import { categoryRows, courses, FEATURED } from "@/data/courses";

/** Category chips + course grid. Picking a chip filters the grid (with an empty state). */
export function CourseBrowser() {
  const [active, setActive] = useState(FEATURED);
  const visible = active === FEATURED ? courses : courses.filter((course) => course.category === active);

  return (
    <div className="flex flex-col gap-12 lg:gap-[77px]">
      {/* Desktop keeps Figma's three rows; smaller screens wrap freely (rows use display: contents). */}
      <div
        role="group"
        aria-label="Course categories"
        className="flex flex-wrap justify-center gap-x-4 gap-y-[21px] lg:flex-col lg:items-center"
      >
        {categoryRows.map((row, i) => (
          <div key={i} className="contents lg:flex lg:gap-4">
            {row.map((category) => (
              <Chip key={category} active={category === active} onClick={() => setActive(category)}>
                {category}
              </Chip>
            ))}
            {i === categoryRows.length - 1 && (
              <Link
                href="/courses"
                prefetch={false}
                className="self-center rounded-sm text-label-m text-primary-800 hover:underline focus-visible:outline-2 focus-visible:outline-primary-600"
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
        <ul aria-label="Courses" className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((course) => (
            <li key={course.slug} className="min-w-0">
              <CourseCard course={course} />
            </li>
          ))}
        </ul>
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
