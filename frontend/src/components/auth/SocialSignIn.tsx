import Link from "next/link";
import { FacebookIcon, GoogleIcon } from "@/components/ui/icons";
import { socialProviders } from "@/data/auth";

const icons = { facebook: FacebookIcon, google: GoogleIcon };

/**
 * Login only: "or" divider + Facebook / Google buttons. Figma: 200px #d1d1d1 lines around a
 * grey "or" (gap 11), 40px below it two 72×72 buttons (24px radius, 1px #d1d1d1 inside, gap 16).
 * OAuth isn't set up → placeholder links without prefetch (see data/navigation.ts).
 */
export function SocialSignIn() {
  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex w-full items-center gap-[11px]" role="separator" aria-label="or">
        <span className="h-px flex-1 bg-rule xl:w-[200px] xl:flex-none" />
        <span aria-hidden="true" className="text-body-l text-hint">
          or
        </span>
        <span className="h-px flex-1 bg-rule xl:w-[200px] xl:flex-none" />
      </div>
      <ul className="flex gap-4">
        {socialProviders.map((provider) => {
          const Icon = icons[provider.id];
          return (
            <li key={provider.id}>
              <Link
                href={provider.href}
                prefetch={false}
                aria-label={provider.label}
                className="flex size-[72px] items-center justify-center rounded-3xl border border-rule text-black transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                <Icon />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
