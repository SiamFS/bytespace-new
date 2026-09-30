import avatar1 from "@/assets/avatars/avatar-1.png";
import avatar2 from "@/assets/avatars/avatar-2.png";
import avatar3 from "@/assets/avatars/avatar-3.png";
import avatar4 from "@/assets/avatars/avatar-4.png";
import avatar5 from "@/assets/avatars/avatar-5.png";
import avatar6 from "@/assets/avatars/avatar-6.png";
import avatar7 from "@/assets/avatars/avatar-7.png";

/**
 * Student avatars from the Figma "Happy Students" card. Decorative — the card's text
 * ("Happy Students", "2K+") already conveys the meaning — so alt is empty.
 */
export const happyStudentAvatars = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7].map(
  (src) => ({ src, alt: "" }),
);
