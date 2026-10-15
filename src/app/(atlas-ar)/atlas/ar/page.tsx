import type { Metadata, Viewport } from "next";
import { AtlasPage } from "@/components/atlas/atlas-page";
import { copy, SITE_URL } from "@/lib/content";

export const viewport: Viewport = {
  themeColor: "#e8e6e1",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: copy.ar.meta.title,
  description: copy.ar.meta.description,
  alternates: {
    canonical: "/ar",
    languages: { en: `${SITE_URL}/en`, ar: `${SITE_URL}/ar` },
  },
  openGraph: {
    title: copy.ar.meta.title,
    description: copy.ar.meta.description,
    url: "/ar",
    locale: "ar_SY",
    alternateLocale: ["en_US"],
  },
};

export default function AtlasArabicPage() {
  return <AtlasPage locale="ar" />;
}