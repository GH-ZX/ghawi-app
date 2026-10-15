import type { MetadataRoute } from "next";
import { locales, SITE_URL } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-01-01");

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    // The canonical address for this content.
    entries.push({
      url: `${SITE_URL}/${locale}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: locale === "en" ? 1 : 0.9,
      alternates: {
        languages: {
          en: `${SITE_URL}/en`,
          ar: `${SITE_URL}/ar`,
        },
      },
    });

    /*
     * The Film design is a second presentation of the same page and declares
     * `canonical` back to the entry above. Listing it as well keeps it
     * discoverable and crawlable without competing with the canonical URL.
     */
    entries.push({
      url: `${SITE_URL}/film/${locale}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.4,
      alternates: {
        languages: {
          en: `${SITE_URL}/film/en`,
          ar: `${SITE_URL}/film/ar`,
        },
      },
    });
  }

  return entries;
}