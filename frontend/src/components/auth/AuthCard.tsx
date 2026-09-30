import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// The two Figma frames lay out the card content differently (EXACT REPLICA RULE):
const layouts = {
  // Login: column with SPACE_BETWEEN over 683px → form block, "or" + social, bottom line.
  between: "xl:h-[683px] xl:justify-between",
  // Register: column with a fixed 122px gap → form block, bottom line (card leaves 51px below).
  gap: "xl:gap-[122px]",
};

// The bottom line's first half is a different grey on each frame.
const promptTones = {
  hint: "text-hint", // Login "New user?" #888888
  muted: "text-neutral-700", // Register "Already have an account?" #4b4c53
};

type AuthCardProps = {
  eyebrow: string;
  title: string;
  layout: keyof typeof layouts;
  /** The form. */
  children: ReactNode;
  /** Optional block between the form and the bottom line (Login: "or" + social buttons). */
  extra?: ReactNode;
  prompt: string;
  promptTone: keyof typeof promptTones;
  switchLink: { label: string; href: string };
};

/**
 * White form card. Figma: 579×784 at (741, 120), 24px radius, content 453px wide starting
 * 61px from the top and 63px from the sides. Heading: blue 18px eyebrow + Poppins 44 title.
 */
export function AuthCard({ eyebrow, title, layout, children, extra, prompt, promptTone, switchLink }: AuthCardProps) {
  return (
    <section
      aria-labelledby="auth-title"
      className={cn(
        "w-full max-w-[579px] rounded-3xl bg-white px-6 py-8 sm:px-[63px] sm:py-12",
        "xl:absolute xl:top-[120px] xl:left-[741px] xl:h-[784px] xl:w-[579px] xl:max-w-none xl:pt-[61px] xl:pb-0",
      )}
    >
      <div className={cn("flex flex-col gap-12", layouts[layout])}>
        <div className="flex flex-col gap-10">
          <div>
            <p className="text-body-l text-primary-800">{eyebrow}</p>
            <h1 id="auth-title" className="font-heading text-heading-m-mobile text-neutral-950 sm:text-heading-m">
              {title}
            </h1>
          </div>
          {children}
        </div>

        {extra}

        <p className="flex flex-wrap justify-center gap-1 text-body-m">
          <span className={promptTones[promptTone]}>{prompt}</span>
          <Link
            href={switchLink.href}
            className="rounded-sm text-primary-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            {switchLink.label}
          </Link>
        </p>
      </div>
    </section>
  );
}
