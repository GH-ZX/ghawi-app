/*
 * The landing page's sections and the nav entries they belong to. Kept apart
 * from content.ts so client components can import these few names without
 * pulling every default word into the browser.
 */

export const SECTION_KEYS = ["work", "testimonials", "services", "pricing", "process", "about", "contact"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export type NavId = "work" | "services" | "about" | "contact";

/** Which nav entry a section counts as: testimonials are Work, pricing and process are Services. */
export const NAV_OF: Record<SectionKey, NavId> = {
  work: "work",
  testimonials: "work",
  services: "services",
  pricing: "services",
  process: "services",
  about: "about",
  contact: "contact",
};
