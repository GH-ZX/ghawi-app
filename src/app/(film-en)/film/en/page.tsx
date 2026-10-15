import type { Metadata, Viewport } from "next";
import { FilmPage } from "@/components/film/film-page";
import { copy, SITE_URL } from "@/lib/content";

/** The Film design has one palette; there is no theme to switch. */
export const viewport: Viewport = {
  themeColor: "#08080a",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: copy.en.meta.title,
  description: copy.en.meta.description,
  alternates: {
    // `/en` stays the canonical address for this content. `/film/*` is a
    // second presentation of the same page, not a second page — pointing
    // both at one canonical avoids duplicate-content signals.
    canonical: "/en",
    languages: {
      en: `${SITE_URL}/en`,
      ar: `${SITE_URL}/ar`,
    },
  },
  openGraph: {
    title: copy.en.meta.title,
    description: copy.en.meta.description,
    url: "/en",
    locale: "en_US",
    alternateLocale: ["ar_SY"],
  },
};

export default function FilmEnglishPage() {
  return <FilmPage locale="en" />;
}