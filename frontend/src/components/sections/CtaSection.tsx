import Image, { type StaticImageData } from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import cylinderLight from "@/assets/shapes/cylinder-light.png";
import coneLight from "@/assets/shapes/cone-light.png";
import springALime from "@/assets/shapes/spring-a-lime-plain.png";
import springBLime from "@/assets/shapes/spring-b-lime.png";
import springLightSmall from "@/assets/shapes/spring-light-small.png";
import torusLime from "@/assets/shapes/torus-lime.png";
import triangleLime from "@/assets/shapes/triangle-lime.png";

// Figma coordinates relative to the 1440×488 CTA frame (image bounds; files are 2x).
const shapes: { src: StaticImageData; left: number; top: number }[] = [
  { src: triangleLime, left: 1078, top: 0 },
  { src: springBLime, left: 1107, top: 289 },
  { src: springALime, left: -122, top: -162 },
  { src: springLightSmall, left: 178, top: 5 },
  { src: coneLight, left: -50, top: 225 },
  { src: torusLime, left: 16, top: 298 },
  { src: cylinderLight, left: 1222, top: 5 },
];

/** Blue "Unlock Your Potential as a Creator" call to action with 3D shapes. */
export function CtaSection() {
  return (
    <section
      aria-labelledby="cta-title"
      className="relative isolate overflow-hidden bg-primary-800 bg-grid py-20 lg:h-[488px] lg:py-0 lg:pt-[85px]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-[1440px] -translate-x-1/2 lg:block"
      >
        {shapes.map((shape, i) => (
          <Image
            key={i}
            src={shape.src}
            alt=""
            sizes={`${Math.round(shape.src.width / 2)}px`}
            className="absolute"
            style={{ left: shape.left, top: shape.top, width: shape.src.width / 2, height: shape.src.height / 2 }}
          />
        ))}
      </div>

      <Container className="relative flex flex-col items-center gap-10">
        <SectionHeading
          id="cta-title"
          tone="light"
          title="Unlock Your Potential as a Creator with ByteSpace"
          titleClassName="max-w-[710px]"
          description="Experience the collaboration of numerous creators and an expanding selection of courses. Register now and become a part of a community comprising over 10,000 local and international creators. Utilize our Course Editor, and showcase your expertise by publishing your finest course on the ByteSpace Course Library."
          spacing="lg"
          className="max-w-[964px]"
        />
        <Button href="/register">
          Join as Creator
        </Button>
      </Container>
    </section>
  );
}
