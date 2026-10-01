import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

// Two copies in Figma that differ only in the label's line height (EXACT REPLICA RULE):
const labelVariants = {
  // Hero (card 232×131): label 14/120% → 17px line.
  hero: "",
  // Growth section (card 232×138): label 14/171% → 24px line.
  growth: "leading-6",
} as const;

type ProgressCardProps = {
  label: string;
  /** 0–100 */
  value: number;
  variant?: keyof typeof labelVariants;
  className?: string;
};

/** "Learning Progress 55%" card (hero + growth section). Figma: 232px wide, 16px padding/radius. */
export function ProgressCard({ label, value, variant = "hero", className }: ProgressCardProps) {
  return (
    <Card radius="md" className={cn("flex w-[232px] flex-col gap-2", className)}>
      <p className={cn("text-label-s text-neutral-950", labelVariants[variant])}>{label}</p>
      <p className="font-heading text-stat text-neutral-950">{value}%</p>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-3xl bg-surface"
      >
        <div className="h-full rounded-3xl bg-secondary-400" style={{ width: `${value}%` }} />
      </div>
    </Card>
  );
}
