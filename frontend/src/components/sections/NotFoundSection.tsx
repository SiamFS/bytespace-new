import { Button } from "@/components/ui/Button";

/**
 * Body of the 404 page (Figma "404 Not Found" frame): blue grid panel, 957px tall on
 * desktop, with a giant lime-gradient "404" behind the heading. Desktop uses the Figma
 * offsets (404 at y160, text block at y521, overlapping it); smaller screens are our design.
 */
export function NotFoundSection() {
  return (
    <section
      aria-labelledby="not-found-title"
      className="overflow-hidden bg-primary-800 bg-grid px-4 pt-32 pb-24 md:pt-40 lg:mb-[3px] lg:h-[957px] lg:px-0 lg:pt-[160px] lg:pb-0"
    >
      <div className="flex flex-col items-center text-center">
        <p className="font-heading text-[10rem] leading-none font-semibold tracking-[-0.01em] text-gradient-404 md:text-[18rem] lg:text-display">
          404
        </p>
        {/* Drawn over the bottom of the "404" (Figma: text block starts 119px above its bottom edge).
            Phones: below it instead — at this size the overlap made the heading hard to read. */}
        <div className="relative mt-2 flex max-w-[935px] flex-col items-center gap-8 md:-mt-[72px] lg:-mt-[119px]">
          <h1 id="not-found-title" className="font-heading text-heading-l-mobile text-white md:text-heading-l">
            The page you are looking for doesn’t exist
          </h1>
          {/* One line on desktop, as in Figma: its box is exactly 486px, and Linux renders Satoshi
              a hair wider, so a max-width alone wraps the last word. */}
          <p className="max-w-[486px] text-body-l text-neutral-100 lg:max-w-none lg:whitespace-nowrap">
            Try to use a correct url or go back to homepage to start again
          </p>
          <Button href="/">Back to Home</Button>
        </div>
      </div>
    </section>
  );
}
