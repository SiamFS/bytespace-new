import Image from "next/image";
import Link from "next/link";
import { AvatarGroup } from "@/components/ui/AvatarGroup";
import { Badge } from "@/components/ui/Badge";
import { LevelIcon, StarOutlinedIcon, StarSharpIcon } from "@/components/ui/icons";
import type { Course } from "@/data/courses";
import { cn } from "@/lib/cn";

/**
 * Figma has two versions of this card: the course grid ("default") and the one in the
 * Growth section ("growth"), which uses taller line heights (140% / 167%), a medium
 * rating with a sharp lime star, and a black "26+" bubble.
 */
const variants = {
  default: {
    padding: "pb-[20px]",
    badge: "", // 12px / 120%
    badgeRow: "bottom-[19px]",
    title: "", // 20px / 120%
    meta: "", // 12px / 160%
    rating: "",
    star: <StarOutlinedIcon className="text-neutral-200" />,
    more: "lime",
  },
  growth: {
    padding: "pb-[15px]", // same 384px card height with the taller lines
    badge: "leading-5", // 12px / 167%
    badgeRow: "bottom-[13px]",
    title: "leading-[1.4]",
    meta: "leading-5",
    rating: "font-medium leading-7", // 18px / 156%
    star: <StarSharpIcon className="text-secondary-400" />,
    more: "dark",
  },
} as const;

type CourseCardProps = {
  course: Course;
  variant?: keyof typeof variants;
  className?: string;
};

/**
 * Course card. Figma: 373×384, 1px neutral-200 border, 24px radius, 16px padding;
 * 341×195 image (12px radius) with frosted meta badges; title truncates to one line.
 * The title link covers the whole card (course pages aren't built yet → no prefetch).
 */
export function CourseCard({ course, variant = "default", className }: CourseCardProps) {
  const v = variants[variant];
  return (
    <article
      className={cn(
        // Figma strokes are inside the 373×384 box; CSS borders add to it, so padding = Figma − 1px.
        "relative flex flex-col rounded-3xl border border-neutral-200 bg-white px-[15px] pt-[15px] transition-shadow",
        "hover:shadow-lg focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-600",
        v.padding,
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
        <ul className={cn("absolute left-[13px] flex gap-3", v.badgeRow)}>
          <li><Badge className={v.badge}>{course.lessons} Lessons</Badge></li>
          <li><Badge className={v.badge}>{course.duration}</Badge></li>
          <li><Badge className={v.badge}>{course.comments} Comments</Badge></li>
        </ul>
      </div>

      <div className="mt-[21px] flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className={cn("truncate font-heading text-heading-xs text-black", v.title)}>
              <Link
                href={`/courses/${course.slug}`}
                prefetch={false}
                title={course.title}
                className="outline-none after:absolute after:inset-0 after:rounded-3xl"
              >
                {course.title}
              </Link>
            </h3>
            <p className={cn("text-body-xs text-muted", v.meta)}>
              by <span className="text-primary-800">{course.author}</span>
            </p>
          </div>
          <p className={cn("flex shrink-0 items-center text-body-l text-muted", v.rating)}>
            {course.rating}
            {v.star}
            <span className="sr-only">out of 5</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge tone="neutral" className={v.badge}>
            <LevelIcon />
            {course.level}
          </Badge>
          <AvatarGroup
            avatars={course.enrolledAvatars}
            more={course.enrolledMore}
            moreTone={v.more}
            size="sm"
          />
        </div>

        <p className="flex items-end">
          <span className="font-heading text-heading-xs text-primary-800">${course.price}</span>
          <span className={cn("text-body-xs text-muted", v.meta)}>/lifetime</span>
        </p>
      </div>
    </article>
  );
}
