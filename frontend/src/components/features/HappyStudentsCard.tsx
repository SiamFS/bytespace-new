import { AvatarGroup } from "@/components/ui/AvatarGroup";
import { StarIcon } from "@/components/ui/icons";
import { happyStudentAvatars } from "@/data/people";
import { cn } from "@/lib/cn";

// Three copies in Figma, each styled differently (EXACT REPLICA RULE — replicate, don't unify):
const variants = {
  // Hero (1:1821): white, title 16/120%, rating 12/160% with a regular dark "4.5".
  hero: {
    card: "bg-white",
    title: "",
    rating: "text-body-xs",
    score: "",
    star: "text-secondary-400",
    more: "lime",
  },
  // Growth section (34:1038): white, title 16/150%, rating 10/150% with a bold "4.5".
  growth: {
    card: "bg-white",
    title: "leading-normal",
    rating: "text-caption leading-normal",
    score: "font-bold",
    star: "text-secondary-400",
    more: "lime",
  },
  // Login / Register (49:313, 49:132): as growth, but lime card, blue star, dark "2K+" bubble.
  auth: {
    card: "bg-secondary-400",
    title: "leading-normal",
    rating: "text-caption leading-normal",
    score: "font-bold",
    star: "text-primary-800",
    more: "ink",
  },
} as const;

type HappyStudentsCardProps = {
  variant?: keyof typeof variants;
  className?: string;
};

/**
 * "Happy Students 4.5 (240) ★" card. Figma: 258px wide, 16px radius and padding, 8px gap —
 * the 232px avatar row slightly overflows the padding, as in the design.
 */
export function HappyStudentsCard({ variant = "hero", className }: HappyStudentsCardProps) {
  const v = variants[variant];
  return (
    <div className={cn("flex w-[258px] flex-col gap-2 rounded-2xl p-4", v.card, className)}>
      <div>
        <p className={cn("text-label-m text-neutral-950", v.title)}>Happy Students</p>
        <p className={cn("flex items-center text-neutral-400", v.rating)}>
          <span className={cn("text-neutral-950", v.score)}>4.5</span>&nbsp;(240)
          <StarIcon className={v.star} />
          <span className="sr-only">average rating</span>
        </p>
      </div>
      <AvatarGroup avatars={happyStudentAvatars} more="2K+" moreTone={v.more} />
    </div>
  );
}
