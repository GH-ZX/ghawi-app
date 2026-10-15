import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
import { copy, SITE_URL } from "@/lib/content";

export const metadata: Metadata = {
  title: "Ahmed Ghawi — Software Engineer",
  description: copy.en.meta.description,
  alternates: {
    canonical: "/en",
    languages: {
      en: `${SITE_URL}/en`,
      ar: `${SITE_URL}/ar`,
      "x-default": `${SITE_URL}/en`,
    },
  },
  openGraph: {
    title: "Ahmed Ghawi — Software Engineer & IT Systems Specialist",
    description: copy.en.meta.description,
    url: "/en",
    locale: "en_US",
    alternateLocale: ["ar_SY"],
  },
};

export default function EnglishPage() {
  return <HomePage locale="en" />;
}