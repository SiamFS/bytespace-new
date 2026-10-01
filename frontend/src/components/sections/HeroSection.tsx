import Image, { type StaticImageData } from "next/image";
import { HappyStudentsCard } from "@/components/features/HappyStudentsCard";
import { PhotoWithShadow } from "@/components/features/PhotoWithShadow";
import { ProgressCard } from "@/components/features/ProgressCard";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import student from "@/assets/photos/student.png";
import cylinderLime from "@/assets/shapes/cylinder-lime.png";
import springLight from "@/assets/shapes/spring-light.png";
import springLightSmall from "@/assets/shapes/spring-light-small.png";
import springLime from "@/assets/shapes/spring-lime.png";
import torusLight from "@/assets/shapes/torus-light.png";
import triangleLight from "@/assets/shapes/triangle-light.png";
import { HeroSearch } from "./HeroSearch";

// 3D shapes, positioned at their Figma coordinates inside the 1440×1024 hero frame.
// PNGs are exported at 2x, so the rendered width is half the file width.
const shapes: { src: StaticImageData; left: number; top: number }[] = [
  { src: springLime, left: -122, top: 221 },
  { src: springLightSmall, left: 183, top: 477 },
  { src: torusLight, left: 14, top: 681 },
  { src: cylinderLime, left: 1227, top: 220 },
  { src: triangleLight, left: 1104, top: 464 },
  { src: springLight, left: 1124, top: 672 },
];

/** Landing hero. Desktop reproduces the 1440×1024 Figma frame; smaller screens stack (our design). */
export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-primary-800 bg-grid pt-28 md:pt-40 lg:h-[1024px] lg:pt-[169px]"
    >
      {/* Desktop stage: fixed 1440×1024 canvas centered on the viewport (Figma coordinates). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -z-10 hidden h-[1024px] w-[1440px] -translate-x-1/2 lg:block"
      >
        <div className="absolute top-[582px] left-[145px] size-[1149px] rounded-full border-[320px] border-secondary-500" />
      </div>

      <Container className="relative z-10 flex flex-col items-center gap-10 text-center lg:gap-[60px]">
        <div className="flex flex-col items-center gap-6 md:gap-8">
          <h1
            id="hero-title"
            className="max-w-[935px] font-heading text-heading-l-mobile text-white md:text-heading-l"
          >
            Get Access to Hundreds Courses Available
          </h1>
          <p className="max-w-[819px] text-body-m text-neutral-100 md:text-body-l">
            Unlock your creativity, gain valuable knowledge, and grow your business with our wide range of courses.
          </p>
        </div>
        <HeroSearch />
      </Container>

      {/* Desktop stage, front layer: photo, stat cards and 3D shapes. */}
      <div className="absolute top-0 left-1/2 hidden h-[1024px] w-[1440px] -translate-x-1/2 lg:block">
        <PhotoWithShadow
          shadow="student"
          src={student}
          alt="Smiling student with headphones holding a laptop"
          loading="eager"
          fetchPriority="high"
          sizes="578px"
          className="absolute top-[512px] left-[431px] h-[541px] w-[578px]"
        />
        <ProgressCard label="Learning Progress" value={55} className="absolute top-[651px] left-[842px]" />
        <HappyStudentsCard className="absolute top-[837px] left-[328px]" />
        {shapes.map((shape, i) => (
          <Image
            key={i}
            src={shape.src}
            alt=""
            sizes={`${Math.round(shape.src.width / 2)}px`}
            className="pointer-events-none absolute"
            style={{
              left: shape.left,
              top: shape.top,
              width: shape.src.width / 2,
              height: shape.src.height / 2,
            }}
          />
        ))}
        <Card radius="md" className="absolute top-[639px] left-[404px] flex flex-col text-left">
          <p className="text-label-m text-neutral-950">UI/UX Design</p>
          <p className="flex items-center gap-2 text-body-xs text-neutral-400">
            <span>200 Courses</span>
            <span aria-hidden="true" className="text-[10px] leading-normal">
              •
            </span>
            <span>1000+ Students</span>
          </p>
        </Card>
      </div>

      {/* Tablet / mobile: photo on a lime ring, stacked below the search (our design). */}
      <div className="relative mt-12 h-[360px] sm:h-[460px] lg:hidden">
        <div
          aria-hidden="true"
          className="absolute top-[40%] left-1/2 size-[640px] -translate-x-1/2 rounded-full border-[180px] border-secondary-500 sm:size-[820px] sm:border-[230px]"
        />
        <PhotoWithShadow
          shadow="student"
          src={student}
          alt="Smiling student with headphones holding a laptop"
          sizes="(min-width: 640px) 480px, 360px"
          className="absolute bottom-0 left-1/2 w-[360px] max-w-none -translate-x-1/2 sm:w-[480px]"
        />
      </div>
    </section>
  );
}
