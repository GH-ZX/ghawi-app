import { Marquee } from "@/components/marquee";
import { About } from "@/components/sections-about";
import { Capabilities } from "@/components/sections-capabilities";
import { Code } from "@/components/sections-code";
import { Contact } from "@/components/sections-contact";
import { Hero } from "@/components/sections-hero";
import { Platforms } from "@/components/sections-platforms";
import { Stats } from "@/components/sections-stats";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { copy, dirOf, turnstileSiteKey, type Locale } from "@/lib/content";

export function HomePage({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    // `contents` keeps the wrapper out of layout flow while still applying
    // lang/dir to every descendant — this is how the Arabic route gets RTL.
    <div lang={locale} dir={dirOf(locale)} className="contents">
      <span id="top" />

      <a
        href="#main"
        className="mono sr-only text-[12px] tracking-[0.1em] text-bg uppercase focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-100 focus:bg-acc focus:px-4 focus:py-2.5"
      >
        {locale === "ar" ? "تخطَّ إلى المحتوى" : "Skip to content"}
      </a>

      <SiteHeader locale={locale} />

      <main id="main" className="flex-1">
        <Hero t={t} />
        <Stats t={t.stats} />
        <Marquee />
        <About t={t.about} />
        <Platforms t={t.platforms} locale={locale} />
        <Code t={t.code} locale={locale} />
        <Capabilities t={t.capabilities} />
        <Contact t={t.contact} locale={locale} turnstileSiteKey={turnstileSiteKey} />
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}