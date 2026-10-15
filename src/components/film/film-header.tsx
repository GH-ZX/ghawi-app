"use client";

import { useState } from "react";
import { copy, profile, type Locale } from "@/lib/content";

/**
 * A detached glass island rather than a bar glued to the top edge.
 * `backdrop-blur` is safe here because the nav is fixed, not a scrolling
 * container. The menu button morphs its two rules into a cross instead of
 * swapping icons.
 */
export function FilmHeader({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [open, setOpen] = useState(false);

  const other: Locale = locale === "ar" ? "en" : "ar";

  // Contact is carried by the pill on desktop; the mobile menu needs it as a
  // row, so the two lists differ rather than repeating it side by side.
  const anchors = [
    { href: "#about", label: t.nav.work },
    { href: "#platforms", label: t.nav.platforms },
    { href: "#code", label: t.nav.code },
    { href: "#capabilities", label: t.nav.capabilities },
  ];
  const menu = [...anchors, { href: "#contact", label: t.nav.contact }];

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[3] px-gutter pt-5">
      <nav className="pointer-events-auto mx-auto flex w-max max-w-full items-center gap-1 rounded-full bg-white/[0.045] py-1.5 pr-1.5 pl-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)] backdrop-blur-xl">
        <a
          href="#top"
          className="display-sm mr-3 text-[0.9375rem] tracking-wide whitespace-nowrap"
        >
          {locale === "ar" ? profile.nameAr : profile.name}
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {anchors.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="block rounded-full px-3 py-2 text-[0.8125rem] font-light text-ivory-2 transition-colors duration-500 hover:bg-white/[0.07] hover:text-ivory"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href={`/film/${other}`}
          hrefLang={other}
          aria-label={other === "ar" ? "العربية" : "English"}
          className="ml-2 rounded-full px-3 py-2 text-[0.75rem] font-medium tracking-[0.1em] text-ivory-2 uppercase transition-colors duration-500 hover:bg-white/[0.07] hover:text-ivory"
        >
          {other}
        </a>

        <a
          href="#contact"
          className="hidden rounded-full bg-ivory px-4 py-2 text-[0.8125rem] font-medium text-stage transition-transform duration-500 hover:scale-[1.03] active:scale-[0.98] md:block"
        >
          {t.nav.contact}
        </a>

        {/* Morphing menu button. */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={t.nav.contact}
          className="relative grid size-9 place-items-center rounded-full bg-white/[0.07] md:hidden"
        >
          <span
            className="absolute h-px w-4 bg-ivory transition-transform duration-500"
            style={{
              transform: open ? "rotate(45deg)" : "translateY(-3px)",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
          <span
            className="absolute h-px w-4 bg-ivory transition-transform duration-500"
            style={{
              transform: open ? "rotate(-45deg)" : "translateY(3px)",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </button>
      </nav>

      {open ? (
        <div
          className="mx-auto mt-2 w-max max-w-full rounded-3xl bg-stage/90 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)] backdrop-blur-2xl md:hidden"
          style={{ animation: "film-menu 0.5s cubic-bezier(0.16, 1, 0.3, 1) both" }}
        >
          <ul className="flex flex-col">
            {menu.map((link, i) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-5 py-3.5 text-[1.0625rem] font-light text-ivory transition-colors duration-300 hover:bg-white/[0.06]"
                  style={{
                    animation: `film-item 0.5s cubic-bezier(0.16, 1, 0.3, 1) both`,
                    animationDelay: `${60 + i * 50}ms`,
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <style>{`
        @keyframes film-menu {
          from { opacity: 0; transform: translate3d(0, -0.75rem, 0) scale(0.97); }
          to   { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes film-item {
          from { opacity: 0; transform: translate3d(0, 0.75rem, 0); }
          to   { opacity: 1; transform: translate3d(0, 0, 0); }
        }
      `}</style>
    </header>
  );
}