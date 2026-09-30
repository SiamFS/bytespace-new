import Image, { type StaticImageData } from "next/image";
import { cn } from "@/lib/cn";

type Avatar = {
  src: string | StaticImageData;
  alt: string;
};

const sizes = {
  // course cards — "26+" is Satoshi 500 12px / 167%
  sm: { box: "size-8", px: 32, overlap: "-ml-2", more: "font-medium leading-5" },
  // hero "Happy Students" card — "2K+" is Satoshi 700 12px / 150%
  md: { box: "size-[43px]", px: 43, overlap: "-ml-4", more: "font-bold leading-normal" },
};

const moreTones = {
  lime: "bg-secondary-400 text-neutral-950",
  // Growth section course card: black bubble, white text
  dark: "bg-black text-white",
};

type AvatarGroupProps = {
  avatars: Avatar[];
  /** Text for the trailing bubble, e.g. "2K+". */
  more?: string;
  moreTone?: keyof typeof moreTones;
  size?: keyof typeof sizes;
  className?: string;
};

/** Row of overlapping circular avatars with an optional "+N" bubble. */
export function AvatarGroup({ avatars, more, moreTone = "lime", size = "md", className }: AvatarGroupProps) {
  const s = sizes[size];

  return (
    <div className={cn("flex items-center", className)}>
      {avatars.map((avatar, i) => (
        <Image
          key={i}
          src={avatar.src}
          alt={avatar.alt}
          width={s.px}
          height={s.px}
          className={cn(s.box, "rounded-full object-cover", i > 0 && s.overlap)}
        />
      ))}
      {more && (
        <span
          className={cn(
            s.box,
            avatars.length > 0 && s.overlap,
            s.more,
            "flex items-center justify-center rounded-full text-body-xs",
            moreTones[moreTone],
          )}
        >
          {more}
        </span>
      )}
    </div>
  );
}
