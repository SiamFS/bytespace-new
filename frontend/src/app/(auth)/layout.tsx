import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

/**
 * Shared shell for /login and /register (Figma frames 49:195 and 47:351): full-height blue
 * grid page, lime logo mark top-left, no navbar or footer.
 *
 * From 1280px up, children sit on a fixed 1440×1024 "stage" at the exact Figma coordinates,
 * centred on the viewport (like the hero). On windows shorter than 1024px the stage is scaled to
 * the window height (--auth-scale, lib/authStageScale.ts), so there's no scrollbar over empty
 * background; the page height follows the scaled stage. Below 1280px the page stacks (our design).
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-primary-800 bg-grid xl:h-[calc(1024px*var(--auth-scale,1))]">
      <div className="flex flex-col items-center gap-8 px-4 pt-6 pb-12 sm:px-8 sm:pb-16 xl:relative xl:left-1/2 xl:block xl:h-[1024px] xl:w-[1440px] xl:origin-top xl:-translate-x-1/2 xl:scale-(--auth-scale) xl:p-0">
        {/* z-10: on xl the <main> below covers the whole stage and would swallow clicks on the logo. */}
        <header className="relative z-10 self-start xl:absolute xl:top-[35px] xl:left-[122px]">
          {/* Figma: the "ByteSpace" wordmark on these frames has no fill, so only the mark shows. */}
          <Link
            href="/"
            aria-label="ByteSpace home"
            className="block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-400"
          >
            <Logo markOnly />
          </Link>
        </header>
        {/* xl: covers the whole stage, so children use page coordinates straight from Figma. */}
        <main className="flex w-full flex-col items-center gap-8 xl:absolute xl:inset-0 xl:block">{children}</main>
      </div>
    </div>
  );
}
