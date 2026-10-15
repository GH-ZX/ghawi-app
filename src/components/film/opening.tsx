"use client";

import { useEffect, useRef, useState } from "react";
import { copy, type Locale } from "@/lib/content";

/**
 * The opening title card.
 *
 * Full-viewport, type-light, and the only place on the page where the
 * display face appears at scale. Parallax is transform-only and driven by a
 * rAF-throttled passive scroll listener — the one case where reading scroll
 * position is genuinely necessary (an IntersectionObserver cannot interpolate).
 */
export function Opening({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const sectionRef = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setShown(true);
    if (reduced) return;

    let frame = 0;
    const read = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      // 0 when the card is fully in view, 1 once it has scrolled entirely past.
      const scrolled = Math.min(Math.max(-rect.top / Math.max(rect.height, 1), 0), 1);
      setProgress(scrolled);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Title drifts up at a third of scroll speed and dissolves as it goes.
  const drift = progress * 34;
  const fade = 1 - progress * 1.5;

  return (
    <section
      ref={sectionRef}
      data-shown={shown ? "true" : "false"}
      className="relative flex min-h-[100dvh] flex-col justify-between overflow-hidden px-gutter pt-8 pb-10"
    >
      <div className="shaft" aria-hidden="true" />

      <div className="relative z-[1] flex items-center justify-between">
        <span className="label text-ivory-2">{t.hero.kicker}</span>
        <span className="label">{t.board.foot[0].value}</span>
      </div>

      <div
        className="relative z-[1] my-auto py-20 will-change-transform"
        style={{
          transform: `translate3d(0, ${-drift}vh, 0)`,
          opacity: Math.max(fade, 0),
        }}
      >
        <p
          className="label mb-8 opacity-0 transition-opacity duration-1000"
          style={{
            transitionDelay: "200ms",
            opacity: shown && fade > 0.2 ? 1 : 0,
          }}
        >
          {t.hero.role}
        </p>

        <h1 className="display text-[clamp(3.5rem,13vw,11rem)]">
          {t.hero.name.map((line, i) => (
            <span
              key={line}
              className="unmask"
              style={{ "--rise-delay": `${180 + i * 130}ms` } as React.CSSProperties}
            >
              <span>{line}</span>
            </span>
          ))}
        </h1>

        <div className="mt-12 flex flex-col gap-10 md:mt-16 md:flex-row md:items-end md:justify-between">
          <p
            className="lead max-w-[46ch] opacity-0 transition-opacity duration-1000"
            style={{ transitionDelay: "620ms", opacity: shown && fade > 0.2 ? 1 : 0 }}
          >
            {t.hero.lead}
          </p>

          <a
            href="#contact"
            className="pill shrink-0 opacity-0 transition-opacity duration-1000"
            style={{ transitionDelay: "780ms", opacity: shown && fade > 0.2 ? 1 : 0 }}
          >
            {t.hero.primary}
            <span data-disc aria-hidden="true">
              <Arrow locale={locale} />
            </span>
          </a>
        </div>
      </div>

      <div className="relative z-[1] flex items-end justify-between">
        <span className="label">{t.hero.scroll}</span>
        <span className="label">{t.board.foot[1].value}</span>
      </div>
    </section>
  );
}

/** Shared arrow. Ultra-thin stroke, never an icon font. */
export function Arrow({ locale }: { locale: Locale }) {
  const down = locale === "ar";
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={
          down
            ? "M8 2.5v11M8 13.5l-3.2-3.2M8 13.5l3.2-3.2"
            : "M2.5 8h11M13.5 8l-3.2-3.2M13.5 8l-3.2 3.2"
        }
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}