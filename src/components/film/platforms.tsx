"use client";

import { useEffect, useRef, useState } from "react";
import { copy, platforms as allPlatforms, type Locale } from "@/lib/content";
import { Reveal } from "./reveal";

/**
 * Platforms, told as two scenes rather than two cards.
 *
 * The copy column scrolls; the plate on the right is pinned and cross-fades
 * between scenes as each block takes centre stage. On small screens the plate
 * collapses inline above its own copy — no pinning, no jank.
 */
export function Platforms({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const items = allPlatforms[locale];
  const [active, setActive] = useState(0);
  const blockRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const io = new IntersectionObserver(
      (entries) => {
        // Pick the block closest to the middle of the viewport, so changing
        // direction mid-scroll does not leave the plate on the wrong scene.
        let best = -1;
        let bestDistance = Infinity;
        for (const entry of entries) {
          const index = blockRefs.current.indexOf(entry.target as HTMLElement);
          if (index < 0) continue;
          const distance = Math.abs(entry.boundingClientRect.top);
          if (entry.isIntersecting && distance < bestDistance) {
            bestDistance = distance;
            best = index;
          }
        }
        if (best >= 0) setActive(best);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );

    for (const el of blockRefs.current) if (el) io.observe(el);
    if (reduced) return () => io.disconnect();
    return () => io.disconnect();
  }, [locale]);

  return (
    <section id="platforms" className="relative px-gutter">
      <div className="mx-auto" style={{ maxWidth: "var(--film-shell)" }}>
        <Reveal className="mb-14 md:mb-20">
          <p className="label mb-6">{t.platforms.label}</p>
          <h2 className="display-sm text-[clamp(2rem,5.2vw,4rem)] text-balance">
            {t.platforms.headline}
          </h2>
        </Reveal>

        <div className="grid gap-12 md:grid-cols-12 md:gap-12">
          {/* Scene copy — tall blocks so the pinned plate has time to breathe. */}
          <div className="md:col-span-6 md:col-start-1">
            {items.map((platform, i) => (
              <article
                key={platform.id}
                ref={(el) => {
                  blockRefs.current[i] = el;
                }}
                className="flex min-h-[68vh] flex-col justify-center border-t border-white/8 py-12 first:border-t-0 first:pt-0"
              >
                <p className="label mb-5">{platform.category}</p>

                <h3 className="display-sm mb-3 text-[clamp(1.875rem,4vw,3.25rem)]">
                  {platform.name}
                </h3>

                <a
                  href={platform.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mb-8 inline-flex w-fit items-center gap-2 text-[0.9375rem] text-beam transition-opacity duration-500 hover:opacity-70"
                >
                  <span className="border-b border-beam/40 pb-0.5">{platform.domain}</span>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M5 11L11 5M11 5H6M11 5v5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>

                <p className="display-sm mb-6 text-[clamp(1.125rem,2vw,1.5rem)] text-ivory">
                  {platform.headline}
                </p>

                <p className="body-quiet mb-10 max-w-[54ch]">{platform.body}</p>

                <dl className="mb-10 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  {platform.features.map((feature) => (
                    <div key={feature.label}>
                      <dt className="label mb-1.5">{feature.label}</dt>
                      <dd className="text-[0.875rem] leading-relaxed font-light text-ivory-2">
                        {feature.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <ul className="flex flex-wrap gap-x-2 gap-y-2">
                  {platform.stack.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-full bg-white/5 px-3.5 py-1.5 text-[0.75rem] font-light text-ivory-2"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          {/* Pinned plate. */}
          <div className="hidden md:col-span-5 md:col-start-8 md:block">
            <div className="sticky top-0 flex h-[100dvh] items-center">
              {/*
                Scenes are absolutely positioned so they can cross-fade in
                place. That means the plate has no content-driven height —
                it needs one explicitly, or it collapses to the height of its
                own overflow and the scene bodies get clipped.
              */}
              <div className="plate relative h-[34rem] w-full">
                {items.map((platform, i) => (
                  <div
                    key={platform.id}
                    aria-hidden={i !== active}
                    className="p-8 transition-all duration-1000 lg:p-10"
                    style={{
                      position: "absolute",
                      inset: 0,
                      transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                      opacity: i === active ? 1 : 0,
                      transform: i === active
                        ? "translate3d(0,0,0)"
                        : "translate3d(0, 1.5rem, 0)",
                      pointerEvents: i === active ? "auto" : "none",
                    }}
                  >
                    <PlateBody
                      name={platform.name}
                      domain={platform.domain}
                      category={platform.category}
                      index={platform.index}
                      href={platform.url}
                      visitLabel={t.platforms.visit}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlateBody({
  name,
  domain,
  category,
  index,
  href,
  visitLabel,
}: {
  name: string;
  domain: string;
  category: string;
  index: string;
  href: string;
  visitLabel: string;
}) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="label">{index}</span>
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-1.5 rounded-full bg-white/20" />
          <span className="size-1.5 rounded-full bg-white/12" />
          <span className="size-1.5 rounded-full bg-white/8" />
        </span>
      </div>

      {/* An abstract, type-led "screen" — no screenshots, no fake chrome. */}
      <div className="my-12">
        <p className="display-sm mb-4 text-[clamp(1.75rem,3vw,2.5rem)]">{name}</p>
        <p className="label mb-8">{category}</p>
        <div className="space-y-2.5" aria-hidden="true">
          <div className="h-1 w-full rounded-full bg-gradient-to-r from-white/18 to-transparent" />
          <div className="h-1 w-4/5 rounded-full bg-gradient-to-r from-white/12 to-transparent" />
          <div className="h-1 w-2/3 rounded-full bg-gradient-to-r from-white/8 to-transparent" />
        </div>
      </div>

      <div className="flex items-end justify-between gap-4">
        <span className="truncate text-[0.8125rem] text-ivory-3">{domain}</span>
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="pill-ghost shrink-0 text-[0.8125rem]"
        >
          {visitLabel}
          <span data-disc aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path
                d="M5 11L11 5M11 5H6M11 5v5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </a>
      </div>
    </div>
  );
}