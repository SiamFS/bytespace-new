import Image from "next/image";
import { CourseCard } from "@/components/features/CourseCard";
import { HappyStudentsCard } from "@/components/features/HappyStudentsCard";
import { ProgressCard } from "@/components/features/ProgressCard";
import { Container } from "@/components/ui/Container";
import { Glow } from "@/components/ui/Glow";
import { CheckCircleIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import heroStudent from "@/assets/hero/student.png";
import creator from "@/assets/growth/creator.png";
import springALime from "@/assets/shapes/spring-a-lime-plain.png";
import springBLime from "@/assets/shapes/spring-b-lime.png";
import { courses } from "@/data/courses";
import { cn } from "@/lib/cn";

const stats = [
  { value: "12K", label: "Students" },
  { value: "70+", label: "Courses" },
  { value: "16", label: "Creators" },
];

const creatorPerks = ["Share Your Expertise", "Monetize Your Passion", "Flexibility and Autonomy", "Build a Community"];

const photoAlt = {
  student: "Smiling student with headphones holding a laptop",
  creator: "Smiling creator with headphones holding a tablet",
};

/**
 * "Your Path to Professional Growth" + "Create & Manage Courses Easily" (one Figma frame:
 * #fafafa with soft blue/lime glows). On desktop, each visual is a fixed box with its
 * children at Figma offsets; below lg only the photo is shown (our responsive design).
 */
export function GrowthSection() {
  return (
    <section
      aria-labelledby="growth-title"
      className="relative isolate overflow-hidden bg-canvas py-20 lg:py-[120px]"
    >
      {/* Glows at Figma coordinates (relative to the section's 1440px frame). */}
      <div aria-hidden="true" className="absolute inset-y-0 left-1/2 -z-10 w-[1440px] -translate-x-1/2">
        <Glow color="primary" size={1137} left={722} top={788} opacity={0.24} />
        <Glow color="secondary" size={1137} left={-152} top={-466} opacity={0.4} />
        <Glow color="primary" size={1137} left={-508} top={183} opacity={0.16} />
        <Glow color="primary" size={1137} left={811} top={-458} opacity={0.08} />
        <Glow color="secondary" size={672} left={-287} top={946} opacity={0.6} />
      </div>

      <Container className="flex flex-col gap-20 lg:gap-[72px]">
        {/* Row 1 — Your Path to Professional Growth */}
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-[63px]">
          <div className="flex flex-col gap-10 lg:w-[574px] lg:shrink-0">
            <SectionHeading
              id="growth-title"
              align="left"
              tone="neutral"
              title="Your Path to Professional Growth Starts Here!"
            />
            <p className="max-w-[477px] text-body-m text-neutral-700 md:text-body-l">
              Explore our curated selection of courses tailored to enhance your capabilities and accelerate your
              career journey. Whether you are looking to sharpen specific skills, gain industry expertise, or embark
              on a new career path entirely, we have the resources you need.
            </p>
            <dl className="flex gap-14">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse">
                  <dt className="text-body-l text-neutral-700">{stat.label}</dt>
                  <dd className="font-heading text-heading-s font-medium text-primary-800">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <PhotoOnMobile src={heroStudent} alt={photoAlt.student} />
          <div className="relative hidden h-[552px] w-[621px] shrink-0 lg:block">
            <CourseCard course={courses[0]} variant="growth" className="absolute top-0 left-0 w-[373px]" />
            <Image
              src={heroStudent}
              alt={photoAlt.student}
              sizes="577px"
              className="absolute top-[12px] left-0 h-[540px] w-[577px] drop-shadow-photo"
            />
            <ProgressCard label="Learning Progress" value={55} className="absolute top-[213px] left-[345px]" />
            <Shape src={springBLime} left={404} top={67} size={216} />
          </div>
        </div>

        {/* Row 2 — Create & Manage Courses Easily */}
        <div className="flex flex-col-reverse items-center gap-12 lg:flex-row lg:gap-[79px]">
          <PhotoOnMobile src={creator} alt={photoAlt.creator} />
          <div className="relative hidden h-[596px] w-[541px] shrink-0 lg:block">
            <RevenueCard className="absolute top-[44px] left-0" />
            <YearToDateCard className="absolute top-[194px] left-0" />
            <Image
              src={creator}
              alt={photoAlt.creator}
              sizes="435px"
              className="absolute top-0 left-[28px] h-[596px] w-[435px] drop-shadow-photo"
            />
            <HappyStudentsCard variant="growth" className="absolute top-[413px] left-[283px]" />
            <Shape src={springALime} left={303} top={114} size={216} />
          </div>

          <div className="flex flex-col gap-10 lg:w-[580px]">
            <SectionHeading
              align="left"
              tone="neutral"
              title="Create & Manage Courses Easily."
              titleClassName="max-w-[391px]"
            />
            <p className="max-w-[574px] text-body-m text-neutral-700 md:text-body-l md:leading-[1.56]">
              <strong className="font-bold text-neutral-950">ByteSpace</strong> supports individuals or entities in
              the creation, publication, and administration of educational courses.
            </p>
            <ul className="flex flex-col gap-4">
              {creatorPerks.map((perk) => (
                <li key={perk} className="flex items-center gap-2 text-label-l text-neutral-950">
                  <CheckCircleIcon className="shrink-0 text-primary-800" />
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

function PhotoOnMobile({ src, alt }: { src: typeof heroStudent; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      sizes="(min-width: 640px) 420px, 90vw"
      className="h-auto w-full max-w-[420px] drop-shadow-photo lg:hidden"
    />
  );
}

function Shape({ src, left, top, size }: { src: typeof springALime; left: number; top: number; size: number }) {
  return (
    <Image
      src={src}
      alt=""
      sizes={`${size}px`}
      className="pointer-events-none absolute"
      style={{ left, top, width: size, height: size }}
    />
  );
}

/** Blue "Total Revenue" card (Figma: 232px, #003be2, 16px radius/padding). */
function RevenueCard({ className }: { className?: string }) {
  return (
    <div className={cn("flex w-[232px] flex-col gap-2 rounded-2xl bg-primary-800 p-4 text-neutral-50", className)}>
      <div>
        <p className="text-label-m">Total Revenue</p>
        <p className="text-caption">July 1-28</p>
      </div>
      <div className="flex items-center justify-between">
        <p className="font-heading text-heading-2xs">$120.29</p>
        <GainPill />
      </div>
      <div className="h-2 w-full overflow-hidden rounded-3xl bg-white" aria-hidden="true">
        <div className="h-full w-[56%] rounded-3xl bg-secondary-400" />
      </div>
    </div>
  );
}

/** Blue "Year to Date" card (Figma: hugs content, 134px). */
function YearToDateCard({ className }: { className?: string }) {
  return (
    <div className={cn("flex w-fit flex-col items-start gap-2 rounded-2xl bg-primary-800 p-4 text-neutral-50", className)}>
      <div>
        <p className="text-label-m">Year to Date</p>
        <p className="text-caption">2023</p>
      </div>
      <p className="font-heading text-heading-2xs">$1,200.38</p>
      <GainPill />
    </div>
  );
}

function GainPill() {
  return (
    <span className="rounded-3xl bg-secondary-500 px-2 py-0.5 text-caption leading-5 font-medium text-neutral-950">
      +12$
    </span>
  );
}
