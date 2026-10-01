import Image, { type StaticImageData } from "next/image";
import type { ComponentProps } from "react";
import creatorShadow from "@/assets/photos/creator-shadow.png";
import studentShadow from "@/assets/photos/student-shadow.png";

// Figma's 8-layer drop shadow on the cut-out photos, pre-rendered by .docs/tools/photo-shadow.cjs
// (a CSS filter with 8 blurred drop-shadows made the page ~20× slower to paint). Each PNG is the
// photo at its Figma size plus this padding; must match PAD in that script.
const PAD = { left: 60, top: 40, right: 160, bottom: 184 };

/** Shadow PNG + the Figma photo size it was rendered for. */
export const photoShadows = {
  student: { src: studentShadow, width: 578, height: 541 },
  creator: { src: creatorShadow, width: 435, height: 596 },
} satisfies Record<string, { src: StaticImageData; width: number; height: number }>;

type PhotoWithShadowProps = Omit<ComponentProps<typeof Image>, "className" | "fill"> & {
  shadow: keyof typeof photoShadows;
  /** Box of the photo (position + size); the shadow is placed relative to it in %, so it scales. */
  className?: string;
};

/** A cut-out photo with Figma's soft shadow behind it. Set a position on the box via `className`. */
export function PhotoWithShadow({ shadow, className, alt, sizes, loading, ...imageProps }: PhotoWithShadowProps) {
  const { src, width, height } = photoShadows[shadow];
  return (
    <div className={className}>
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        sizes={sizes}
        loading={loading}
        className="pointer-events-none absolute max-w-none"
        style={{
          left: `${(-PAD.left / width) * 100}%`,
          top: `${(-PAD.top / height) * 100}%`,
          width: `${((width + PAD.left + PAD.right) / width) * 100}%`,
          height: `${((height + PAD.top + PAD.bottom) / height) * 100}%`,
        }}
      />
      <Image {...imageProps} alt={alt} sizes={sizes} loading={loading} className="relative block h-full w-full" />
    </div>
  );
}
