export type NavItem = {
  label: string;
  href: string;
  /**
   * The route isn't built yet — don't prefetch it. In production Next.js prefetches
   * visible links, and prefetching a missing route logs a 404 in the console.
   * Remove the flag once the page exists.
   */
  placeholder?: true;
};

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses", placeholder: true },
  { label: "Creators", href: "/creators", placeholder: true },
];

export const authNav: NavItem[] = [
  { label: "Sign In", href: "/login", placeholder: true },
  { label: "Join Us", href: "/register", placeholder: true },
];

export const cartLink: NavItem = { label: "Cart", href: "/cart", placeholder: true };

export type FooterColumn = {
  /** Screen-reader heading — the Figma headings have no fill, so they're invisible. */
  title: string;
  links: NavItem[];
};

export const footerColumns: FooterColumn[] = [
  {
    title: "Browse",
    links: [
      { label: "Featured Courses", href: "/courses", placeholder: true },
      { label: "Featured Categories", href: "/categories", placeholder: true },
      { label: "Business", href: "/courses?category=business", placeholder: true },
      { label: "IT", href: "/courses?category=it", placeholder: true },
      { label: "Design", href: "/courses?category=design", placeholder: true },
    ],
  },
  {
    title: "Categories",
    links: [
      { label: "Development", href: "/courses?category=development", placeholder: true },
      { label: "Marketing", href: "/courses?category=marketing", placeholder: true },
      { label: "Photography", href: "/courses?category=photography", placeholder: true },
      { label: "Finance", href: "/courses?category=finance", placeholder: true },
      { label: "Sport", href: "/courses?category=sport", placeholder: true },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Become a Creator", href: "/register", placeholder: true },
      { label: "Affiliate Program", href: "/affiliate", placeholder: true },
      { label: "Contact", href: "/contact", placeholder: true },
      { label: "Help", href: "/help", placeholder: true },
      { label: "About", href: "/about", placeholder: true },
    ],
  },
];

export const legalLinks: NavItem[] = [
  { label: "Privacy Policy", href: "/privacy", placeholder: true },
  { label: "Terms of Service", href: "/terms", placeholder: true },
  { label: "Cookies Settings", href: "/cookies", placeholder: true },
];
