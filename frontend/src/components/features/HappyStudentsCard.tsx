import { AvatarGroup } from "@/components/ui/AvatarGroup";
import { Card } from "@/components/ui/Card";
import { StarIcon } from "@/components/ui/icons";
import { happyStudentAvatars } from "@/data/people";
import { cn } from "@/lib/cn";

type HappyStudentsCardProps = {
  className?: string;
};

/** "Happy Students 4.5 (240) ★" card. Figma: fixed 258px wide — the 232px avatar row slightly overflows the padding, as in the design. */
export function HappyStudentsCard({ className }: HappyStudentsCardProps) {
  return (
    <Card radius="md" className={cn("flex w-[258px] flex-col gap-2", className)}>
      <div>
        <p className="text-label-m text-neutral-950">Happy Students</p>
        <p className="flex items-center text-body-xs text-neutral-400">
          <span className="text-neutral-950">4.5</span>&nbsp;(240)
          <StarIcon className="text-secondary-400" />
          <span className="sr-only">average rating</span>
        </p>
      </div>
      <AvatarGroup avatars={happyStudentAvatars} more="2K+" />
    </Card>
  );
}
