import Image from "next/image";
import { CourseCard } from "@/components/features/CourseCard";
import { HappyStudentsCard } from "@/components/features/HappyStudentsCard";
import { courses } from "@/data/courses";
import springLightSmall from "@/assets/shapes/spring-light-small.png";
import torusLime from "@/assets/shapes/torus-lime.png";
import triangleLime from "@/assets/shapes/triangle-lime.png";

const buildDigitalAsset = courses.find((course) => course.slug === "build-digital-asset")!;
const powerOfBigData = courses.find((course) => course.slug === "the-power-of-big-data")!;

type AuthPromoProps = {
  title: string;
  text: string;
};

/**
 * Left side of the auth pages: title + paragraph, then the decorative collage (two course
 * cards, lime Happy Students card, 3D shapes) at the Figma coordinates. The collage is `inert`
 * (no focus, hidden from assistive tech) and only shown from 1280px up.
 */
export function AuthPromo({ title, text }: AuthPromoProps) {
  return (
    <>
      <div className="flex max-w-[475px] flex-col gap-4 text-center text-neutral-50 xl:absolute xl:top-[120px] xl:left-[122px] xl:w-[475px] xl:text-left">
        <p className="font-heading text-heading-xs">{title}</p>
        <p className="text-body-l">{text}</p>
      </div>

      {/* Paint order follows the Figma layer order: cards, Happy Students, spring, torus, cone. */}
      <div inert className="pointer-events-none absolute inset-0 hidden xl:block">
        {/* Positioned wrappers: CourseCard is `relative` itself, and two position classes on one
            element conflict (no tailwind-merge). */}
        <div className="absolute top-[394px] left-[122px] w-[373px]">
          <CourseCard course={buildDigitalAsset} variant="growth" />
        </div>
        <div className="absolute top-[305px] left-[233px] w-[373px]">
          <CourseCard course={powerOfBigData} variant="growth" />
        </div>
        <HappyStudentsCard variant="auth" className="absolute top-[740px] left-[348px]" />
        {/* Shape PNGs are Figma renders at 2x (tint + rotation baked in), placed at the image node's box. */}
        <Image src={springLightSmall} alt="" width={177} className="absolute top-[626px] left-[470px]" />
        <Image src={torusLime} alt="" width={147} className="absolute top-[320px] left-[149px]" />
        <Image src={triangleLime} alt="" width={189} className="absolute top-[702px] left-[95px]" />
      </div>
    </>
  );
}
