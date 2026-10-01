import { Container } from "@/components/ui/Container";
import type { LegalDocument } from "@/data/legal";

/**
 * Privacy Policy / Terms of Service (our design — not in Figma). A short blue grid header like
 * the 404 page (the Navbar is drawn over it), then the text in a readable 768px column.
 */
export function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <article aria-labelledby="legal-title">
      <header className="bg-primary-800 bg-grid pt-32 pb-16 md:pt-40 md:pb-20">
        <Container>
          <div className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
            <h1 id="legal-title" className="font-heading text-heading-l-mobile text-white md:text-heading-m">
              {document.title}
            </h1>
            <p className="text-body-m text-neutral-100">Last updated {document.updated}</p>
          </div>
        </Container>
      </header>

      <Container>
        <div className="mx-auto flex max-w-3xl flex-col gap-10 py-16 md:py-20">
          <p className="text-body-l text-neutral-700">{document.intro}</p>
          {document.sections.map((section) => (
            <section key={section.heading} className="flex flex-col gap-3">
              <h2 className="font-heading text-heading-xs text-neutral-950">{section.heading}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="text-body-m text-neutral-700">
                  {paragraph}
                </p>
              ))}
              {section.items && (
                <ul className="flex list-disc flex-col gap-2 pl-5 text-body-m text-neutral-700 marker:text-primary-600">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </Container>
    </article>
  );
}
