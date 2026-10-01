/**
 * Desktop login / register pages are the 1440×1024 Figma frame (app/(auth)/layout.tsx). On screens
 * shorter than 1024px that scrolled through empty background, so the frame is scaled down to the
 * window height instead — keeping the Figma proportions, exact at 1024px and taller. Below
 * MIN_SCALE (~717px tall) it stops shrinking and the page scrolls, so text stays readable.
 *
 * The value lives in the `--auth-scale` CSS variable on <html>, set by an inline script in the root
 * layout before the first paint (no jump) and on every resize.
 */
export const AUTH_STAGE_HEIGHT = 1024;
export const AUTH_MIN_SCALE = 0.7;

export const authStageScale = (windowHeight: number) =>
  Math.min(1, Math.max(AUTH_MIN_SCALE, windowHeight / AUTH_STAGE_HEIGHT));

/** Inline script for next/script: same formula, no imports (it runs before any bundle). */
export const authStageScaleScript = `(function () {
  var root = document.documentElement;
  function update() {
    var scale = Math.min(1, Math.max(${AUTH_MIN_SCALE}, window.innerHeight / ${AUTH_STAGE_HEIGHT}));
    root.style.setProperty("--auth-scale", String(scale));
  }
  update();
  window.addEventListener("resize", update);
})();`;
