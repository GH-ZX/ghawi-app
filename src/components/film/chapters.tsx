import { copy, type Locale } from "@/lib/content";
import { Reveal } from "./reveal";

/**
 * The middle act: a statement, the record in numbers, background, and what
 * can be handed over. All four are static server markup — only the Reveal
 * wrapper is client-side, so the HTML below ships complete.
 */

/* ------------------------------------------------------------------ *
 *  Statement — full-bleed, centred, the loudest line on the page.
 * ------------------------------------------------------------------ */

export function Statement({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <section className="px-gutter py-40 md:py-56">
      <div className="mx-auto" style={{ maxWidth: "68rem" }}>
        <Reveal className="text-center">
          <p className="display-sm text-[clamp(2rem,6.4vw,5.25rem)] text-balance">
            {t.about.headline}
          </p>
        </Reveal>

        <div className="mt-20 grid gap-10 text-center md:mt-28 md:grid-cols-2">
          {t.about.body.map((paragraph, i) => (
            <Reveal key={paragraph.slice(0, 24)} delay={120 + i * 120}>
              <p className="body-quiet mx-auto max-w-[48ch]">{paragraph}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 *  Numbers — the record, set at architectural scale.
 * ------------------------------------------------------------------ */

export function Numbers({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <section className="px-gutter py-28 md:py-40">
      <div
        className="mx-auto grid gap-y-14 sm:grid-cols-2 lg:grid-cols-4"
        style={{ maxWidth: "var(--film-shell)" }}
      >
        {t.stats.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 90}>
            <p className="display mb-4 text-[clamp(3rem,7vw,5.5rem)] text-ivory">
              {stat.value}
            </p>
            <p className="max-w-[18ch] text-[0.875rem] leading-relaxed font-light text-ivory-3">
              {stat.label}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 *  Background — asymmetric split, deliberately off-balance.
 * ------------------------------------------------------------------ */

export function About({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <section id="about" className="px-gutter py-28 md:py-40">
      <div className="mx-auto grid gap-16 md:grid-cols-12 md:gap-10">
        <Reveal className="md:col-span-5">
          <p className="label mb-8">{t.about.label}</p>
          <h2 className="display-sm text-[clamp(1.875rem,4.4vw,3.5rem)] text-balance">
            {t.about.disciplineTitle}
          </h2>
        </Reveal>

        <div className="md:col-span-6 md:col-start-7">
          {t.about.discipline.map((row, i) => (
            <Reveal key={row.label} delay={i * 70}>
              <div className="flex flex-col gap-2 border-t border-white/8 py-7 first:border-t-0 first:pt-0 md:flex-row md:gap-10">
                <p className="label shrink-0 md:w-44">{row.label}</p>
                <p className="max-w-[52ch] text-[0.9375rem] leading-relaxed font-light text-ivory-2">
                  {row.value}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 *  Capabilities — staggered, so the eye has to travel.
 * ------------------------------------------------------------------ */

export function Capabilities({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <section id="capabilities" className="px-gutter py-28 md:py-40">
      <div className="mx-auto" style={{ maxWidth: "var(--film-shell)" }}>
        <Reveal className="mb-20 md:mb-28">
          <p className="label mb-6">{t.capabilities.label}</p>
          <h2 className="display-sm text-[clamp(2rem,5vw,3.75rem)]">{t.capabilities.headline}</h2>
        </Reveal>

        <ol className="space-y-4">
          {t.capabilities.items.map((item, i) => (
            <Reveal as="li" key={item.index} delay={i * 80}>
              <article className="group grid gap-6 rounded-3xl bg-white/[0.022] p-8 transition-colors duration-700 hover:bg-white/[0.045] md:grid-cols-12 md:gap-10 md:p-12">
                <p className="label md:col-span-1">{item.index}</p>
                <h3 className="display-sm text-[clamp(1.375rem,2.6vw,2rem)] md:col-span-4">
                  {item.title}
                </h3>
                <p className="body-quiet md:col-span-6 md:col-start-7">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}