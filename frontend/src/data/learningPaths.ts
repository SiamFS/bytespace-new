import type { ComponentType, SVGProps } from "react";
import {
  BusinessIcon,
  DesignIcon,
  DevelopmentIcon,
  ItSoftwareIcon,
  MarketingIcon,
  PhotographyIcon,
} from "@/components/ui/icons";

export type LearningPath = {
  label: string;
  slug: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

/** "Explore Diverse Learning Paths" tiles (Figma order). */
export const learningPaths: LearningPath[] = [
  { label: "Design", slug: "design", Icon: DesignIcon },
  { label: "Development", slug: "development", Icon: DevelopmentIcon },
  { label: "IT & Software", slug: "it-software", Icon: ItSoftwareIcon },
  { label: "Business", slug: "business", Icon: BusinessIcon },
  { label: "Marketing", slug: "marketing", Icon: MarketingIcon },
  { label: "Photography", slug: "photography", Icon: PhotographyIcon },
];
