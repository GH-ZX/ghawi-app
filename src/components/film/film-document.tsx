import type { ReactNode } from "react";
import { filmFontVariables } from "@/lib/film-fonts";
import "@/styles/film.css";

/**
 * The Film document.
 *
 * Rendered by two sibling root layouts — `(film-en)` and `(film-ar)` — so
 * `<html>` itself carries the correct `lang` and `dir` instead of relying on a
 * wrapper mid-tree. That keeps assistive technology, hyphenation and logical
 * properties correct from the root down, and lets the stylesheet key off
 * `[lang="ar"]` alone.
 */
export function FilmDocument({
  lang,
  dir,
  children,
}: {
  lang: "en" | "ar";
  dir: "ltr" | "rtl";
  children: ReactNode;
}) {
  return (
    <html lang={lang} dir={dir} className={`${filmFontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/* Fixed, pointer-events-none: sits above content, costs nothing. */}
        <div className="grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}