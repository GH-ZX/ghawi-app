import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { fontVariables } from "@/lib/fonts";
import { chromeColors, prePaintScript, presetCss, storeTheme } from "@/lib/theme";
import "@/styles/base.css";
import "@/styles/admin.css";

export const metadata: Metadata = {
  title: "Inbox · ghawi.app",
  robots: { index: false, follow: false },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
};

export function generateViewport(): Viewport {
  return { colorScheme: "light dark", themeColor: chromeColors().light };
}

/** The admin's own root: English, same design system, never indexed. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      data-preset={storeTheme.preset}
      data-site={storeTheme.preset}
      data-default={storeTheme.mode}
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <style id="theme" dangerouslySetInnerHTML={{ __html: presetCss() }} />
        <script dangerouslySetInnerHTML={{ __html: prePaintScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
