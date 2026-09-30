import type { StaticImageData } from "next/image";
import sarah from "@/assets/avatars/avatar-9.png";
import alex from "@/assets/avatars/testimonial-alex.png";
import james from "@/assets/avatars/testimonial-james.png";

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  avatar: StaticImageData;
  /** Name line height — Figma uses 120% on the first card and 140% on the others. */
  nameLeading: "tight" | "normal";
};

/** Testimonials from the Figma "Testimonials_Frame" (copy kept as in the design). */
export const testimonials: Testimonial[] = [
  {
    name: "Sarah M.",
    role: "Enthusiastic Learner",
    quote:
      "ByteSpace has transformed my approach to learning. The diverse range of courses and the quality of content provided by creators have exceeded my expectations. The platform truly fosters a sense of community and lifelong learning.",
    avatar: sarah,
    nameLeading: "tight",
  },
  {
    name: "James L.",
    role: "Lifelong Learner",
    quote:
      "I've tried several online learning platforms, and ByteSpace stands out for its vibrant community and the variety of courses available. The easy navigation and engaging content make it a go-to platform for continuous skill development.",
    avatar: james,
    nameLeading: "normal",
  },
  {
    name: "Alex B.",
    role: "Inspired Creator",
    quote:
      "As a creator, ByteSpace has been a game-changer for me. The Course Editor is user-friendly, and the support from the community is incredible. It's fulfilling to see my courses making a positive impact on learners globally.",
    avatar: alex,
    nameLeading: "normal",
  },
];
