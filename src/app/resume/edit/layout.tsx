import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { inter, mono, plexArabic } from "@/lib/fonts";
import "@/styles/base.css";
import "@/styles/admin.css";
import "@/styles/cv.css";

/** The CV builder's own root (cv.ghawi.app/edit): private, never indexed. */
export const metadata: Metadata = {
  title: "CV builder · cv.ghawi.app",
  robots: { index: false, follow: false },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
};

export const viewport: Viewport = { colorScheme: "light", themeColor: "#eceef1" };

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${plexArabic.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
