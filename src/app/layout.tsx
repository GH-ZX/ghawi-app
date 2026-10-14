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
  themeColor: "#07080a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}