import type { Viewport } from "next";
import type { ReactNode } from "react";
import { inter, mono, plexArabic } from "@/lib/fonts";
import { defaultLocale, dirOf, isLocale, locales } from "@/lib/content";
import "@/styles/base.css";
import "@/styles/cv.css";

/*
 * cv.ghawi.app's own root: a document, not the site. No themes, no dark mode,
 * plain type. next.config.ts rewrites the subdomain here: "/" is English,
 * "/ar" Arabic.
 */

export const dynamicParams = false;
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = { colorScheme: "light", themeColor: "#eceef1" };

export default async function ResumeLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  return (
    <html lang={locale} dir={dirOf(locale)} className={`${inter.variable} ${plexArabic.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
