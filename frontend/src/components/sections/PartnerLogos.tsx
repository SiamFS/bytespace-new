import Image from "next/image";
import partner1 from "@/assets/partners/partner-1.svg";
import partner2 from "@/assets/partners/partner-2.svg";
import partner3 from "@/assets/partners/partner-3.svg";
import partner4 from "@/assets/partners/partner-4.svg";
import partner5 from "@/assets/partners/partner-5.svg";

const partners = [partner1, partner2, partner3, partner4, partner5];

/** Partner logo strip. Figma: #f5f5f6 band, 202px tall, 5 logos 72px apart, bottom-aligned. */
export function PartnerLogos() {
  return (
    <section aria-label="Our partners" className="bg-neutral-50 py-12 lg:py-20">
      <ul className="mx-auto flex max-w-[1200px] flex-wrap items-end justify-center gap-x-10 gap-y-8 px-4 lg:gap-x-[72px]">
        {partners.map((logo, i) => (
          <li key={i}>
            <Image src={logo} alt="Logoipsum" className="h-8 w-auto lg:h-auto" />
          </li>
        ))}
      </ul>
    </section>
  );
}
