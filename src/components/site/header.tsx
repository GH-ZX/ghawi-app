"use client";

import { type MouseEvent } from "react";
import { GlobeIcon, MoonIcon, SunIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { getEffectiveMode, setMode } from "@/lib/theme-client";
import { dirOf, type Dictionary, type Locale } from "@/lib/content";
import { SECTION_IDS, useActiveSection } from "./use-active-section";

type Props = {
  locale: Locale;
  name: string;
  nav: Dictionary["nav"];
  ui: Dictionary["ui"];
};

/** GH Store's floating glass header: the logo on the left in both languages. */
export function Header({ locale, name, nav, ui }: Props) {
  const active = useActiveSection();

  return (
    <header className="header" dir="ltr">
      <a href="#top" className="header__brand">
        <Logo draw height={22} />
        <span className="header__sep" aria-hidden="true" />
        <span className="header__name" dir="auto">
          {name}
        </span>
      </a>

      <nav className="header__nav" aria-label={ui.nav} dir={dirOf(locale)}>
        {SECTION_IDS.map((id) => (
          <a key={id} href={`#${id}`} aria-current={active === id ? "true" : undefined}>
            {nav[id]}
          </a>
        ))}
      </nav>

      <div className="header__actions">
        <LanguageLink locale={locale} ui={ui} />
        <ModeToggle toLight={ui.toLight} toDark={ui.toDark} />
        <a className="btn btn--xs press header__cta" href="#contact">
          {nav.cta}
        </a>
      </div>
    </header>
  );
}

/**
 * A plain link: the other language is a different document (its own lang and
 * dir), so a full load is the honest navigation. The choice is remembered for
 * the bare domain, and the current section carries over.
 */
export function LanguageLink({ locale, ui }: { locale: Locale; ui: Dictionary["ui"] }) {
  const other: Locale = locale === "en" ? "ar" : "en";

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    document.cookie = `lang=${other}; path=/; max-age=31536000; samesite=lax`;
    event.currentTarget.href = `/${other}${window.location.hash}`;
  }

  return (
    <a
      href={`/${other}`}
      hrefLang={other}
      lang={other}
      onClick={onClick}
      className="icon-btn press header__lang"
      aria-label={ui.switchLanguage}
      title={ui.switchLanguage}
    >
      <GlobeIcon size={16} />
      <span style={{ marginInlineStart: 6 }}>{other === "ar" ? "ع" : "EN"}</span>
    </a>
  );
}

/** Shows the moon in light mode and the sun in dark; CSS picks the half. */
export function ModeToggle({ toLight, toDark }: { toLight: string; toDark: string }) {
  return (
    <button
      type="button"
      className="icon-btn press"
      onClick={() => setMode(getEffectiveMode() === "dark" ? "light" : "dark")}
    >
      <span className="when-light">
        <MoonIcon />
        <span className="sr-only">{toDark}</span>
      </span>
      <span className="when-dark">
        <SunIcon />
        <span className="sr-only">{toLight}</span>
      </span>
    </button>
  );
}
