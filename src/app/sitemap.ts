import type { MetadataRoute } from "next";
import { CASE_SLUGS, CV_URL, locales, SITE_URL } from "@/lib/content";

/** The home page and the case studies, each in both languages, and the CV on its subdomain. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    { path: "", priority: 1, changeFrequency: "monthly" as const },
    ...CASE_SLUGS.map((slug) => ({ path: `/work/${slug}`, priority: 0.8, changeFrequency: "monthly" as const })),
  ];
  const cvLanguages = { en: CV_URL, ar: `${CV_URL}/ar` };
  const cv: MetadataRoute.Sitemap = [
    { url: CV_URL, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6, alternates: { languages: cvLanguages } },
    { url: `${CV_URL}/ar`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5, alternates: { languages: cvLanguages } },
  ];

  const pages = paths.flatMap(({ path, priority, changeFrequency }) => {
    const languages = Object.fromEntries(locales.map((locale) => [locale, `${SITE_URL}/${locale}${path}`]));
    return locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority: locale === "en" ? priority : Math.round(priority * 90) / 100,
      alternates: { languages },
    }));
  });
  return [...pages, ...cv];
}
