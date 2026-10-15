"use client";

import { useEffect, useRef } from "react";
import { atlas, type Locale } from "@/lib/content";
import { PLATES } from "./plates";
import { useReducedMotion } from "./atlas-scroll";

/**
 * The signature Atlas move.
 *
 * A long statement revealed word by word, with small drawn plates surfacing
 * inline between certain words. The plates are real elements in the token
 * stream rather than an overlay, so the line wraps exactly as authored and
 * the copy stays selectable, translatable and crawlable.
 *
 * Words are observed individually so the reveal tracks the reader rather than
 * firing one animation for the whole block.
 */
export function WordReveal({ locale }: { locale: Locale }) {
  const t = atlas[locale];
  const reduced = useReducedMotion();
  const seen = useRef(false);

  useEffect(() => {
    if (reduced) {
      for (const el of document.querySelectorAll("[data-word], [data-plate]")) {
        el.setAttribute("data-on", "true");
      }
      return;
    }

    const nodes = Array.from(document.querySelectorAll("[data-word], [data-plate]"));
    if (!nodes.length || seen.current) return;
    seen.current = true;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          // Neighbouring words resolve almost together, so the paragraph reads
          // as a moving line rather than a stutter of individual letters.
          const index = Number(el.dataset.index ?? "0");
          el.style.setProperty("--atlas-delay", `${Math.min(index, 6) * 55}ms`);
          el.setAttribute("data-on", "true");
          io.unobserve(el);
        }
      },
      // A band across the middle of the viewport: words light up as the line
      // crosses it, and stay lit once lit.
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 },
    );

    for (const el of nodes) io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-8">
      <p className="kicker md:col-span-3 md:pt-3">{t.aside}</p>

      <p className="display-sm text-[clamp(1.5rem,3.6vw,3rem)] text-balance md:col-span-9">
        {t.statement.map((word, i) => (
          <span key={`${word.t}-${i}`}>
            <span className="word" data-word data-index={i}>
              {word.t}
            </span>
            {word.plate ? (
              <span className="plate-slot" data-plate data-index={i}>
                {(() => {
                  const Plate = PLATES[word.plate];
                  return <Plate label={t.workKicker} />;
                })()}
              </span>
            ) : (
              " "
            )}
          </span>
        ))}
      </p>
    </div>
  );
}