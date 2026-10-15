import type { ReactNode } from "react";
import { atlasFontVariables } from "@/lib/atlas-fonts";
import "@/styles/atlas.css";

/**
 * Root layout for Atlas, rendered by two sibling route groups —
 * `(atlas-en)` and `(atlas-ar)` — so `<html>` carries the correct lang/dir
 * rather than relying on a wrapper mid-tree.
 */
export function AtlasDocument({
  lang,
  dir,
  children,
}: {
  lang: "en" | "ar";
  dir: "ltr" | "rtl";
  children: ReactNode;
}) {
  return (
    <html lang={lang} dir={dir} className={`${atlasFontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/* Static paper tooth. Fixed and pointer-events-none. */}
        <div className="tooth" aria-hidden="true" />
        <div className="flex min-h-full flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}