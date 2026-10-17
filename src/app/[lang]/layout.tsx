import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { fontVariables } from "@/lib/fonts";
import { chromeColors, prePaintScript, presetCss, storeTheme } from "@/lib/theme";
import { defaultLocale, dictionaries, dirOf, isLocale, locales, profile, SITE_URL } from "@/lib/content";
import "@/styles/base.css";
import "@/styles/site.css";

type Params = { params: Promise<{ lang: string }> };

/** /en and /ar are the only pages; anything else under / is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  const t = dictionaries[locale];

  return {
    metadataBase: new URL(SITE_URL),
    title: t.meta.title,
    description: t.meta.description,
    applicationName: "ghawi.app",
    authors: [{ name: profile.name, url: SITE_URL }],
    creator: profile.name,
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", ar: "/ar", "x-default": "/en" },
    },
    openGraph: {
      type: "profile",
      siteName: "ghawi.app",
      title: t.meta.title,
      description: t.meta.description,
      url: `/${locale}`,
      locale: locale === "ar" ? "ar_SY" : "en_US",
      alternateLocale: locale === "ar" ? ["en_US"] : ["ar_SY"],
      firstName: "Ahmed",
      lastName: "Ghawi",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: t.meta.ogAlt, type: "image/png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
      images: [{ url: "/og.png", alt: t.meta.ogAlt }],
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    formatDetection: { telephone: false },
  };
}

export function generateViewport(): Viewport {
  const chrome = chromeColors();
  // Address-bar colour follows GH Store's default mode, like the page does.
  const themeColor =
    storeTheme.mode === "system"
      ? [
          { media: "(prefers-color-scheme: light)", color: chrome.light },
          { media: "(prefers-color-scheme: dark)", color: chrome.dark },
        ]
      : chrome[storeTheme.mode];
  return { colorScheme: "light dark", themeColor };
}

export default async function SiteLayout({ children, params }: Params & { children: ReactNode }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;

  return (
    <html
      lang={locale}
      dir={dirOf(locale)}
      data-preset={storeTheme.preset}
      data-site={storeTheme.preset}
      data-default={storeTheme.mode}
      className={fontVariables}
      // The pre-paint script may set data-preset / data-mode before React runs.
      suppressHydrationWarning
    >
      <head>
        {/* GH Store's four presets, light and dark, keyed by data-preset. */}
        <style id="theme" dangerouslySetInnerHTML={{ __html: presetCss() }} />
        <script dangerouslySetInnerHTML={{ __html: prePaintScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
