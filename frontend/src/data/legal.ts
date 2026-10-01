/**
 * Privacy policy and terms (not in Figma — Google sign-in needs both links on its consent screen).
 * Keep them true to what the code does: backend/prisma/schema.prisma (stored fields),
 * backend/src/lib/session.ts + controllers/google.controller.ts (cookies), config/rateLimits.ts.
 */
export type LegalSection = { heading: string; paragraphs?: string[]; items?: string[] };
export type LegalDocument = { title: string; updated: string; intro: string; sections: LegalSection[] };

const CONTACT = "siamferdous1@gmail.com";
const UPDATED = "October 1, 2026";

export const privacyPolicy: LegalDocument = {
  title: "Privacy Policy",
  updated: UPDATED,
  intro:
    "ByteSpace is a demo learning platform built as a software engineering project. This page explains what we store when you create an account or sign in, and why.",
  sections: [
    {
      heading: "What we store",
      items: [
        "Your name and email address.",
        "Your password, only as a bcrypt hash — the password itself is never stored or logged.",
        "If you sign in with Google: your Google account ID, name and email address (Google's openid, email and profile permissions). We don't store your Google profile photo, and we never get your Google password.",
        "When your account was created.",
      ],
    },
    {
      heading: "Why we store it",
      paragraphs: ["Only to create your account, sign you in and show your name in the navigation bar. There are no ads and no tracking."],
    },
    {
      heading: "Cookies",
      items: [
        "session — keeps you signed in for up to 7 days. It is HttpOnly (page scripts can't read it) and removed when you log out.",
        "oauth_google — exists for at most 10 minutes during Google sign-in, to check that the answer from Google belongs to the sign-in you started.",
        "We don't use analytics, advertising or third-party tracking cookies.",
      ],
    },
    {
      heading: "Security and abuse protection",
      paragraphs: [
        "To slow down password guessing, we count sign-in and sign-up attempts per IP address and email for a short time (up to one hour), then the counters expire.",
      ],
    },
    {
      heading: "Where your data is kept",
      paragraphs: [
        "The website and API run on Vercel. Accounts are stored in a PostgreSQL database on Neon and attempt counters in Redis on Upstash, both in Singapore.",
      ],
    },
    {
      heading: "Sharing",
      paragraphs: ["We don't sell or share your data with anyone. Google only takes part when you choose \"Continue with Google\"."],
    },
    {
      heading: "Deleting your account",
      paragraphs: [`Email ${CONTACT} from the address on your account and we'll delete the account and its data.`],
    },
    {
      heading: "Contact",
      paragraphs: [`Questions about this policy: ${CONTACT}.`],
    },
  ],
};

export const termsOfService: LegalDocument = {
  title: "Terms of Service",
  updated: UPDATED,
  intro:
    "ByteSpace is a demo learning platform built as a software engineering project. By creating an account you agree to these terms.",
  sections: [
    {
      heading: "A demo, not a shop",
      paragraphs: [
        "The courses, prices, creators and testimonials on this site are sample content from the design. Nothing can be bought, and no payment details are ever requested.",
      ],
    },
    {
      heading: "Your account",
      items: [
        "Use your real email address and keep your password to yourself.",
        "Don't try to break, overload or misuse the service — for example automated sign-ups or password guessing.",
        "We may remove accounts that misuse the service.",
      ],
    },
    {
      heading: "No guarantees",
      paragraphs: [
        "The service is provided as it is, without any warranty. It may change, be reset or be taken offline at any time, and accounts may be deleted when it is.",
      ],
    },
    {
      heading: "Privacy",
      paragraphs: ["How we handle your data is described in the Privacy Policy."],
    },
    {
      heading: "Contact",
      paragraphs: [`Questions about these terms: ${CONTACT}.`],
    },
  ],
};
