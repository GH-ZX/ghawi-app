import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
import { copy, SITE_URL } from "@/lib/content";

export const metadata: Metadata = {
  title: "أحمد غاوي — مهندس برمجيات",
  description: copy.ar.meta.description,
  alternates: {
    canonical: "/ar",
    languages: {
      en: `${SITE_URL}/en`,
      ar: `${SITE_URL}/ar`,
      "x-default": `${SITE_URL}/en`,
    },
  },
  openGraph: {
    title: "أحمد غاوي — مهندس برمجيات وأخصائي أنظمة تقنية",
    description: copy.ar.meta.description,
    url: "/ar",
    locale: "ar_SY",
    alternateLocale: ["en_US"],
  },
};

export default function ArabicPage() {
  return <HomePage locale="ar" />;
}