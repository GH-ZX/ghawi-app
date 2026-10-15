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
  title: copy.ar.meta.title,
  description: copy.ar.meta.description,
  alternates: {
    canonical: "/ar",
    languages: {
      en: `${SITE_URL}/en`,
      ar: `${SITE_URL}/ar`,
    },
  },
  openGraph: {
    title: copy.ar.meta.title,
    description: copy.ar.meta.description,
    url: "/ar",
    locale: "ar_SY",
    alternateLocale: ["en_US"],
  },
};

export default function FilmArabicPage() {
  return <FilmPage locale="ar" />;
}