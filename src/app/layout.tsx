import { themeScript } from "@/lib/theme-script";
import type { Metadata, Viewport } from "next";
import { fontVariables } from "./fonts";
import { profile, SITE_URL } from "@/lib/content";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ahmed Ghawi — Software Engineer · ghawi.app",
    template: "%s · ghawi.app",
  },
  description:
    "Software engineer and IT systems specialist. Two commerce platforms in production: GH Store and Bot Factory.",
  applicationName: "ghawi.app",
  authors: [{ name: profile.name, url: "https://ghawi.app" }],
  creator: profile.name,
  publisher: profile.name,
  alternates: {
    canonical: "/en",
    languages: {
      en: "/en",
      ar: "/ar",
      "x-default": "/en",
    },
  },
  openGraph: {
    type: "profile",
    siteName: "ghawi.app",
    title: "Ahmed Ghawi — Software Engineer & IT Systems Specialist",
    description:
      "I build and operate the software behind digital commerce. Two platforms live right now: GH Store and Bot Factory.",
    url: "/en",
    locale: "en_US",
    alternateLocale: ["ar_SY"],
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ahmed Ghawi — Software Engineer & IT Systems Specialist",
    description: "Two commerce platforms in production. Built and operated from Aleppo, Syria.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon" }],
  },
};

export const viewport: Viewport = {
  // The active theme is admin-selectable at runtime, so the browser UI is
  // allowed to follow either scheme. The address bar colour is rewritten by
  // themeScript once the real theme is known.
  colorScheme: "dark light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <head>
        {/* Exists so themeScript can retarget the address bar at runtime;
            the content here is only the pre-hydration fallback. */}
        <meta name="theme-color" content="#07080a" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        {/* Film grain. Only the ember theme paints it; the element exists once
            so every route inherits it without a per-page opt-in. */}
        <div className="ember-grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}