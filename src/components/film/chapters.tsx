import { copy, profile, type Locale } from "@/lib/content";
import { Reveal } from "./reveal";
import { CountUp, Drift, Parallax, Scrub } from "./scroll";

/**
 * The middle act: a statement, the record in numbers, the stack, background,
 * and what can be handed over.
 *
 * The statement is scrubbed rather than triggered, and the numbers count, so
 * the page has two distinct kinds of motion instead of one repeated reveal.
 */

/* ------------------------------------------------------------------ *
 *  Statement — masked in step with scroll, not on a timer.
 * ------------------------------------------------------------------ */

export function Statement({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <section className="relative px-gutter py-40 md:py-56">
      <div className="mx-auto" style={{ maxWidth: "68rem" }}>
        <Scrub>
          <p className="display-sm text-[clamp(2rem,6.4vw,5.25rem)] text-balance">
            {t.about.headline}
          </p>
        </Scrub>

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
 *  Numbers — drift upward as they pass, and count once on entry.
 * ------------------------------------------------------------------ */

export function Numbers({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <section className="relative px-gutter py-28 md:py-40">
      <div
        className="mx-auto grid gap-y-14 sm:grid-cols-2 lg:grid-cols-4"
        style={{ maxWidth: "var(--film-shell)" }}
      >
        {t.stats.map((stat, i) => (
          <Parallax key={stat.label} speed={0.09 + i * 0.045}>
            <Reveal delay={i * 90}>
              <p className="display mb-4 text-[clamp(3rem,7vw,5.5rem)] text-ivory">
                <CountUp value={stat.value} />
              </p>
              <p className="max-w-[18ch] text-[0.875rem] leading-relaxed font-light text-ivory-3">
                {stat.label}
              </p>
            </Reveal>
          </Parallax>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 *  Stack — a wide strip travelling sideways against the vertical scroll.
 * ------------------------------------------------------------------ */

export function Stack() {
  const items = [
    "TypeScript", "React", "Next.js", "Tailwind", "FastAPI", "Python",
    "Aiogram 3", "PostgreSQL", "Redis", "Supabase", "Cloudflare", "Docker",
    "Flutter", "C#", "Linux", "Git",
  ];

  return (
    <section aria-hidden="true" className="relative py-16 md:py-24">
      <Drift distance={-22}>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {items.map((item) => (
              <span key={`${copy}-${item}`} className="flex shrink-0 items-center">
                <span className="display-sm px-8 text-[clamp(1.75rem,4vw,3.5rem)] whitespace-nowrap text-ivory/12">
                  {item}
                </span>
                <span className="size-1 rounded-full bg-beam/25" />
              </span>
            ))}
          </div>
        ))}
      </Drift>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 *  About — the portrait, drifting against its own section.
 * ------------------------------------------------------------------ */

export function About({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <section id="about" className="relative px-gutter py-28 md:py-40">
      <div className="mx-auto grid gap-16 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          {/* Oversized and offset, so the plate bleeds past its column. */}
          <Parallax speed={-0.09} className="md:-ms-10">
            <figure className="plate">
              <div className="overflow-hidden">
                {/*
                  A plain img, deliberately. next/image would push
                  optimisation to the Worker at request time; this file is
                  already a correctly sized WebP derivative, encoded once.
                */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/media/film/portrait.webp"
                  alt={locale === "ar" ? `صورة ${profile.nameAr}` : `${profile.name}, ${profile.role}`}
                  width={1200}
                  height={1500}
                  loading="lazy"
                  decoding="async"
                  className="w-full scale-[1.04] object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(0.16,1,0.3,1)]"
                />
              </div>
              <figcaption className="flex items-center justify-between gap-4 px-6 py-4">
                <span className="label">
                  {locale === "ar" ? profile.locationAr : profile.location}
                </span>
                <span className="label">{locale === "ar" ? profile.roleAr : profile.role}</span>
              </figcaption>
            </figure>
          </Parallax>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <Reveal>
            <p className="label mb-8">{t.about.label}</p>
            <h2 className="display-sm mb-14 text-[clamp(1.875rem,4.4vw,3.5rem)] text-balance">
              {t.about.disciplineTitle}
            </h2>
          </Reveal>

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