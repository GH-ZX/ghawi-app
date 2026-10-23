import { NAV_OF, type NavId } from "@/lib/sections";
import {
  AVAILABILITY,
  CASE_SLUGS,
  DEFAULT_CONTENT,
  HERO_CHANNELS,
  SECTION_KEYS,
  type Availability,
  type CaseSlug,
  type Dictionary,
  type HeroChannel,
  type Links,
  type Locale,
  type Profile,
  type SectionKey,
  type Settings,
  type SiteContent,
} from "@/lib/content";

/*
 * The admin's saved edits, laid over the defaults. Whatever arrives — from D1
 * or from the editor — is reshaped to the defaults' own shape: unknown keys
 * are dropped, wrong types fall back, and fields the code adds later fill in
 * from the defaults. The page never sees junk. Runs on the server and in the
 * admin's browser alike.
 */

const MAX_TEXT = 4000;
const MAX_ITEMS = 40;

/** Item shapes for lists whose default is empty, keyed by their path. */
const TEMPLATES: Record<string, unknown> = {
  "testimonials.items": { quote: "", name: "", role: "", url: "" },
  "projects.links": { label: "", href: "" },
};

type Plain = Record<string, unknown>;

const isPlain = (value: unknown): value is Plain =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

/** The same shape with every value emptied: a new list item starts from this. */
export function blank<T>(model: T): T {
  if (typeof model === "string") return "" as T;
  if (typeof model === "boolean") return false as T;
  if (typeof model === "number") return 0 as T;
  if (Array.isArray(model)) return [] as T;
  if (isPlain(model)) return Object.fromEntries(Object.entries(model).map(([k, v]) => [k, blank(v)])) as T;
  return model;
}

/** Strip an index from a path: "projects.0.links" → "projects.links". */
const listPath = (path: string) => path.replace(/\.\d+(?=\.|$)/g, "");

/** A fresh item for the list at `path`, given its default `list`. */
export function itemTemplate(path: string, list: unknown[]): unknown {
  const model = list[0] ?? TEMPLATES[listPath(path)];
  return model === undefined ? "" : blank(model);
}

function shape<T>(fallback: T, input: unknown, path: string): T {
  if (typeof fallback === "string") {
    return (typeof input === "string" ? input.slice(0, MAX_TEXT) : fallback) as T;
  }
  if (typeof fallback === "boolean") return (typeof input === "boolean" ? input : fallback) as T;
  if (typeof fallback === "number") return (typeof input === "number" && Number.isFinite(input) ? input : fallback) as T;
  if (Array.isArray(fallback)) {
    if (!Array.isArray(input)) return fallback;
    const model = fallback[0] ?? TEMPLATES[listPath(path)];
    if (model === undefined) return [] as T;
    // A default item fills an older save's missing fields; a new item starts empty.
    return input
      .slice(0, MAX_ITEMS)
      .map((item, index) => shape(fallback[index] ?? blank(model), item, `${path}.${index}`)) as T;
  }
  if (isPlain(fallback)) {
    const source = isPlain(input) ? input : {};
    const out: Plain = {};
    for (const key of Object.keys(fallback)) out[key] = shape(fallback[key], source[key], path ? `${path}.${key}` : key);
    return out as T;
  }
  return fallback;
}

function sanitizeSettings(input: unknown): Settings {
  const base = DEFAULT_CONTENT.settings;
  const raw = isPlain(input) ? input : {};
  const loose = shape(base, raw, "settings");

  // Every section exactly once: the saved order first, any new ones after.
  const seen = new Set<SectionKey>();
  const sections: Settings["sections"] = [];
  for (const entry of Array.isArray(raw.sections) ? raw.sections : []) {
    if (!isPlain(entry) || !SECTION_KEYS.includes(entry.id as SectionKey) || seen.has(entry.id as SectionKey)) continue;
    seen.add(entry.id as SectionKey);
    sections.push({ id: entry.id as SectionKey, visible: entry.visible !== false });
  }
  for (const entry of base.sections) if (!seen.has(entry.id)) sections.push({ ...entry });

  return {
    ...loose,
    availability: AVAILABILITY.includes(loose.availability) ? loose.availability : base.availability,
    heroChannel: HERO_CHANNELS.includes(loose.heroChannel) ? loose.heroChannel : base.heroChannel,
    sections,
    stack: loose.stack.map((item) => item.trim()).filter(Boolean),
    beacon: /^[a-f0-9]{32}$/i.test(loose.beacon.trim()) ? loose.beacon.trim() : "",
  };
}

export function sanitizeContent(input: unknown): SiteContent {
  const raw = isPlain(input) ? input : {};
  const profile = shape(DEFAULT_CONTENT.profile, raw.profile, "profile");
  return {
    profile: {
      ...profile,
      telegram: profile.telegram.trim().replace(/^@/, ""),
      instagram: profile.instagram.trim().replace(/^@/, ""),
      github: profile.github.trim().replace(/^@/, ""),
    },
    links: shape(DEFAULT_CONTENT.links, raw.links, "links"),
    settings: sanitizeSettings(raw.settings),
    en: shape(DEFAULT_CONTENT.en, raw.en, ""),
    ar: shape(DEFAULT_CONTENT.ar, raw.ar, ""),
  };
}

/* ------------------------------------------------------------------ *
 *  Derived values
 * ------------------------------------------------------------------ */

export type ContactUrls = {
  telegram: string;
  whatsapp: string;
  instagram: string;
  github: string;
  linkedin: string;
  email: string;
};

/** Every contact link, built from the handles in the profile. */
export function contactUrls(profile: Profile, whatsappText = ""): ContactUrls {
  const digits = profile.whatsapp.replace(/[^\d]/g, "");
  return {
    telegram: `https://t.me/${encodeURIComponent(profile.telegram)}`,
    whatsapp: `https://wa.me/${digits}${whatsappText ? `?text=${encodeURIComponent(whatsappText)}` : ""}`,
    instagram: `https://www.instagram.com/${encodeURIComponent(profile.instagram)}/`,
    github: `https://github.com/${encodeURIComponent(profile.github)}`,
    linkedin: profile.linkedin,
    email: `mailto:${profile.email}`,
  };
}

/** How a channel is written next to its name. */
export function channelValue(id: string, profile: Profile): string {
  switch (id) {
    case "telegram":
      return `@${profile.telegram}`;
    case "whatsapp":
      return profile.whatsapp;
    case "instagram":
      return `@${profile.instagram}`;
    case "github":
      return profile.github;
    case "linkedin":
      return profile.name;
    default:
      return "";
  }
}

/** "@ghstore_robot" from "https://t.me/ghstore_robot". */
export function handleOf(url: string): string {
  const last = url.replace(/\/+$/, "").split("/").pop() ?? "";
  return last ? `@${last.replace(/^@/, "")}` : "";
}

/** Fills {products}; null when the count is unknown, so the caller can hide it. */
export function withProducts(text: string, products: number): string | null {
  if (!text.includes("{products}")) return text;
  return products > 0 ? text.replaceAll("{products}", String(products)) : null;
}

/** The sections to render, in the admin's order. */
export function visibleSections(settings: Settings): SectionKey[] {
  return settings.sections.filter((s) => s.visible).map((s) => s.id);
}

export const isCaseSlug = (value: string): value is CaseSlug => (CASE_SLUGS as readonly string[]).includes(value);

export function caseOf(dict: Dictionary, slug: CaseSlug) {
  return dict.cases.items.find((item) => item.slug === slug) ?? null;
}

export const isAvailability = (value: unknown): value is Availability => AVAILABILITY.includes(value as Availability);
export const isHeroChannel = (value: unknown): value is HeroChannel => HERO_CHANNELS.includes(value as HeroChannel);

/** Everything a section needs, built once per page. */
export type PageContext = {
  locale: Locale;
  t: Dictionary;
  profile: Profile;
  links: Links;
  settings: Settings;
  urls: ContactUrls;
  /** GH Store's live product count at build time; 0 when unknown. */
  products: number;
  /** Where the home page's anchors live: "" on it, "/en" on the CV and case pages. */
  home: string;
};

export function pageContext(content: SiteContent, locale: Locale, products: number, home = ""): PageContext {
  const t = content[locale];
  return {
    locale,
    t,
    profile: content.profile,
    links: content.links,
    settings: content.settings,
    urls: contactUrls(content.profile, t.contact.whatsappText),
    products,
    home,
  };
}

/** The nav entries for the visible sections, in page order. */
export function navOf(settings: Settings): NavId[] {
  const out: NavId[] = [];
  for (const id of visibleSections(settings)) if (!out.includes(NAV_OF[id])) out.push(NAV_OF[id]);
  return out;
}
