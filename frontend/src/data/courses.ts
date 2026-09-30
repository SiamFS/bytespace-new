import type { StaticImageData } from "next/image";
import avatar2 from "@/assets/avatars/avatar-2.png";
import avatar8 from "@/assets/avatars/avatar-8.png";
import avatar9 from "@/assets/avatars/avatar-9.png";
import avatar10 from "@/assets/avatars/avatar-10.png";
import bigData from "@/assets/courses/big-data.jpg";
import digitalAsset from "@/assets/courses/digital-asset.jpg";
import learnFigma from "@/assets/courses/learn-figma.jpg";
import money from "@/assets/courses/money.jpg";
import productivity from "@/assets/courses/productivity.jpg";
import startup from "@/assets/courses/startup.jpg";

export type Course = {
  slug: string;
  title: string;
  author: string;
  image: StaticImageData;
  category: string;
  level: string;
  lessons: number;
  duration: string;
  comments: number;
  rating: number;
  price: number;
  enrolledAvatars: { src: StaticImageData; alt: string }[];
  enrolledMore: string;
};

// Same four learners on every card in the design. Decorative (the "+N" conveys it).
const enrolledAvatars = [avatar2, avatar8, avatar9, avatar10].map((src) => ({ src, alt: "" }));

const shared = {
  author: "purepearl studio",
  level: "Beginner",
  lessons: 17,
  duration: "2 hours 16 mins",
  comments: 59,
  rating: 4.5,
  price: 25,
  enrolledAvatars,
  enrolledMore: "26+",
};

/**
 * Course cards from the Figma "Discover Your Passion" grid. Titles copied exactly
 * (including the lowercase "the Power of Big Data"). Categories are our mapping onto
 * the design's category chips — the design doesn't assign them.
 */
export const courses: Course[] = [
  { ...shared, slug: "learn-figma-from-basic", title: "Learn Figma from Basic", image: learnFigma, category: "UI/UX Design" },
  { ...shared, slug: "build-digital-asset", title: "Build Digital Asset", image: digitalAsset, category: "Graphic Design" },
  { ...shared, slug: "the-power-of-big-data", title: "the Power of Big Data", image: bigData, category: "Data Science" },
  { ...shared, slug: "balancing-productivity-and-self-care", title: "Balancing Productivity and Self-Care", image: productivity, category: "Productivity" },
  { ...shared, slug: "mastering-money-management", title: "Mastering Money Management", image: money, category: "Freelance & Entrepreneurship" },
  { ...shared, slug: "from-idea-to-startup-success", title: "From Idea to Startup Success", image: startup, category: "Freelance & Entrepreneurship" },
];

/** "Featured" shows every course; the others filter by `Course.category`. */
export const FEATURED = "Featured";

/** Category chips exactly as laid out in Figma: three centered rows. */
export const categoryRows: string[][] = [
  [FEATURED, "Music", "Drawing & Painting", "Marketing", "Animation", "Social Media", "UI/UX Design", "Creative Marketing"],
  ["Digital Illustration", "Film & Video", "Crafts", "Freelance & Entrepreneurship", "Graphic Design", "Photography"],
  ["Productivity", "Web Development", "Data Science", "Cooking"],
];
