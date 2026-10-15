import type { Metadata, Viewport } from "next";
import { AtlasPage } from "@/components/atlas/atlas-page";
import { atlas, copy, SITE_URL } from "@/lib/content";

export const viewport: Viewport = {
  themeColor: "#e8e6e1",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: copy.en.meta.title,
  description: copy.en.meta.description,
  alternates: {
    // A third presentation of the same content; canonical stays on /en.
    canonical: "/en",
    languages: { en: `${SITE_URL}/en`, ar: `${SITE_URL}/ar` },
  },
  openGraph: {
    title: copy.en.meta.title,
    description: copy.en.meta.description,
    url: "/en",
    locale: "en_US",
    alternateLocale: ["ar_SY"],
  },
};

export default function AtlasEnglishPage() {
  return <AtlasPage locale="en" />;
}

/** Keeps the type from drifting if `atlas` gains fields later. */
export type AtlasCopyRef = typeof atlas.en;