import type { CSSProperties } from "react";

const colors = {
  primary: "var(--color-primary-800)", // #003be2
  secondary: "var(--color-secondary-500)", // #cbfc01
};

type GlowProps = {
  color: keyof typeof colors;
  /** Diameter in px. */
  size: number;
  left: number;
  top: number;
  /** Layer opacity from Figma (0–1). */
  opacity: number;
};

/**
 * Soft blurred color blob (Figma: radial gradient ellipse — color 0% → 23% at 53% →
 * 6% at 75% → transparent, layer blur 40px). Purely decorative; place inside a
 * `relative overflow-hidden` section.
 */
export function Glow({ color, size, left, top, opacity }: GlowProps) {
  const c = colors[color];
  const style: CSSProperties = {
    left,
    top,
    width: size,
    height: size,
    opacity,
    background: `radial-gradient(closest-side, ${c} 0%, color-mix(in srgb, ${c} 23%, transparent) 53%, color-mix(in srgb, ${c} 6%, transparent) 75%, transparent 100%)`,
  };
  return <div aria-hidden="true" className="pointer-events-none absolute rounded-full blur-[40px]" style={style} />;
}
