"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { profile, type Copy, type Locale } from "@/lib/content";

export function SiteHeader({ locale, t }: { locale: Locale; t: Copy["nav"] }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links: { href: string; label: string }[] = [
    { href: "#about", label: t.work },
    { href: "#platforms", label: t.platforms },
    { href: "#code", label: t.code },
    { href: "#capabilities", label: t.capabilities },
  ];

  return (
    <header
      data-scrolled={scrolled ? "true" : "false"}
      className="fixed inset-x-0 top-0 z-50 h-[var(--nav-h)] border-b border-line-2/70 bg-bg/72 backdrop-blur-xl transition-colors duration-300 data-[scrolled=false]:border-transparent data-[scrolled=false]:bg-transparent data-[scrolled=false]:backdrop-blur-none"
    >
      <div className="shell flex h-full items-center justify-between gap-6">
        {/* Wordmark */}
        <Link
          href={`/${locale}`}
          className="group flex shrink-0 items-center gap-2.5"
          aria-label={profile.name}
        >
          <span className="relative grid size-7 place-items-center border border-line-2 bg-bg-2 font-mono text-[11px] font-medium text-fg">
            <span className="transition-colors duration-200 group-hover:text-acc">GH</span>
            <span className="absolute -end-px -bottom-px size-1.5 bg-acc" />
          </span>
          <span className="mono hidden text-xs tracking-[0.14em] text-fg-2 uppercase transition-colors duration-200 group-hover:text-fg sm:block">
            ghawi<span className="text-fg-3">.app</span>
          </span>
        </Link>

        {/* Primary nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative px-3 py-2 text-[13px] text-fg-2 transition-colors duration-200 hover:text-fg"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2.5">
          <LocaleSwitcher locale={locale} />
          <a
            href="#contact"
            className="sweep mono relative hidden h-9 items-center border border-line-2 px-4 text-[11px] tracking-[0.12em] text-fg uppercase transition-colors duration-200 hover:text-bg sm:flex"
          >
            <span className="relative z-10">{t.contact}</span>
          </a>
        </div>
      </div>
    </header>
  );
}