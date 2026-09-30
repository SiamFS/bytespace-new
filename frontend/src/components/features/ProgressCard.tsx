import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type ProgressCardProps = {
  label: string;
  /** 0–100 */
  value: number;
  className?: string;
};

/** "Learning Progress 55%" card (hero + growth section). Figma: 232px wide, 16px padding/radius. */
export function ProgressCard({ label, value, className }: ProgressCardProps) {
  return (
    <Card radius="md" className={cn("flex w-[232px] flex-col gap-2", className)}>
      <p className="text-label-s text-neutral-950">{label}</p>
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
