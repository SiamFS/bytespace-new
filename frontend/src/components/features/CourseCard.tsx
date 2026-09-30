import Image from "next/image";
import Link from "next/link";
import { AvatarGroup } from "@/components/ui/AvatarGroup";
import { Badge } from "@/components/ui/Badge";
import { LevelIcon, StarOutlinedIcon } from "@/components/ui/icons";
import type { Course } from "@/data/courses";
import { cn } from "@/lib/cn";

type CourseCardProps = {
  course: Course;
  className?: string;
};

/**
 * Course card. Figma: 373×384, 1px neutral-200 border, 24px radius, 16px padding;
 * 341×195 image (12px radius) with frosted meta badges; title truncates to one line.
 * The title link covers the whole card (course pages aren't built yet → no prefetch).
 */
export function CourseCard({ course, className }: CourseCardProps) {
  return (
    <article
      className={cn(
        // Figma strokes are inside the 373×384 box; CSS borders add to it, so padding = Figma − 1px.
        "relative flex flex-col rounded-3xl border border-neutral-200 bg-white px-[15px] pt-[15px] pb-[20px] transition-shadow",
        "hover:shadow-lg focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-600",
        className,
      )}
    >
      <div className="relative h-[195px] overflow-hidden rounded-xl">
        <Image
          src={course.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 341px, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <ul className="absolute bottom-[19px] left-[13px] flex gap-3">
          <li><Badge>{course.lessons} Lessons</Badge></li>
          <li><Badge>{course.duration}</Badge></li>
          <li><Badge>{course.comments} Comments</Badge></li>
        </ul>
      </div>

      <div className="mt-[21px] flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-heading text-heading-xs text-black">
              <Link
                href={`/courses/${course.slug}`}
                prefetch={false}
                title={course.title}
                className="outline-none after:absolute after:inset-0 after:rounded-3xl"
              >
                {course.title}
              </Link>
            </h3>
            <p className="text-body-xs text-muted">
              by <span className="text-primary-800">{course.author}</span>
            </p>
          </div>
          <p className="flex shrink-0 items-center text-body-l text-muted">
            {course.rating}
            <StarOutlinedIcon className="text-neutral-200" />
            <span className="sr-only">out of 5</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge tone="neutral">
            <LevelIcon />
            {course.level}
          </Badge>
          <AvatarGroup avatars={course.enrolledAvatars} more={course.enrolledMore} size="sm" />
        </div>

        <p className="flex items-end">
          <span className="font-heading text-heading-xs text-primary-800">${course.price}</span>
          <span className="text-body-xs text-muted">/lifetime</span>
        </p>
      </div>
    </article>
  );
}
