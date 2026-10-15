import { type Locale } from "@/lib/content";
import { About, Capabilities, Numbers, Statement } from "./chapters";
import { Code } from "./code";
import { Contact } from "./contact";
import { FilmFooter } from "./film-footer";
import { FilmHeader } from "./film-header";
import { Opening } from "./opening";
import { Platforms } from "./platforms";

/**
 * Composition root for the Film design.
 *
 * Imports nothing from `src/components/` — the only shared dependency is the
 * content module, because the copy itself should not fork.
 */
export function FilmPage({ locale }: { locale: Locale }) {
  return (
    // No lang/dir wrapper needed: each locale has its own root layout, so
    // <html lang dir> is already correct and the stylesheet can key off it.
    <>
      <span id="top" />

      <a
        href="#platforms"
        className="sr-only focus:not-sr-only focus:fixed focus:top-5 focus:start-5 focus:z-[4] focus:rounded-full focus:bg-ivory focus:px-5 focus:py-2.5 focus:text-[0.8125rem] focus:font-medium focus:text-stage"
      >
        {locale === "ar" ? "تخطَّ إلى المحتوى" : "Skip to content"}
      </a>

      <FilmHeader locale={locale} />

      <main>
        <Opening locale={locale} />
        <Statement locale={locale} />
        <Numbers locale={locale} />
        <Platforms locale={locale} />
        <About locale={locale} />
        <Code locale={locale} />
        <Capabilities locale={locale} />
        <Contact locale={locale} />
      </main>

      <FilmFooter locale={locale} />
    </>
  );
}