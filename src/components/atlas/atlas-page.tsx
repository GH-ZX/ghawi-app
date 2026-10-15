import { atlas, copy, links, platforms, profile, type Locale } from "@/lib/content";
import { PLATES } from "./plates";
import { Reveal, ScrollProgress } from "./atlas-scroll";
import { WordReveal } from "./word-reveal";

/**
 * Composition root for Atlas.
 *
 * Imports nothing from the other two designs' component folders; the only
 * shared dependency is the content module.
 */
export function AtlasPage({ locale }: { locale: Locale }) {
  const t = atlas[locale];
  const base = copy[locale];
  const other: Locale = locale === "ar" ? "en" : "ar";
  const name = locale === "ar" ? profile.nameAr : profile.name;

  return (
    <>
      <ScrollProgress />
      <span id="top" />

      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:fixed focus:top-5 focus:start-5 focus:z-[4] focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-[0.8125rem] focus:text-paper"
      >
        {base.nav.platforms}
      </a>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <header className="px-gutter pt-5">
        <nav className="mx-auto flex w-max max-w-full items-center gap-1 rounded-full bg-paper-1/85 py-1.5 pr-1.5 pl-2 shadow-[inset_0_0_0_1px_rgba(22,23,26,0.1)] backdrop-blur-xl">
          <a
            href="#top"
            className="flex items-center gap-2.5 rounded-full py-1 pr-4 ps-1 text-[0.875rem] font-semibold"
          >
            <span className="grid size-8 place-items-center rounded-full bg-ink text-paper">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 12.5L8 2l6 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
            </span>
            {name}
          </a>

          <ul className="hidden items-center gap-0.5 md:flex">
            {[
              { href: "#work", label: t.workKicker },
              { href: "#record", label: t.recordKicker },
              { href: "#profile", label: t.profileKicker },
            ].map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block rounded-full px-3.5 py-2 text-[0.8125rem] text-ink-2 transition-colors duration-500 hover:bg-ink/6 hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`/atlas/${other}`}
                hrefLang={other}
                className="block rounded-full px-3.5 py-2 text-[0.8125rem] text-ink-2 transition-colors duration-500 hover:bg-ink/6 hover:text-ink"
              >
                {other === "ar" ? "العربية" : "English"}
              </a>
            </li>
          </ul>

          <a
            href="#contact"
            className="rounded-full bg-ink px-4 py-2 text-[0.8125rem] font-medium text-paper transition-transform duration-500 hover:scale-[1.03] active:scale-[0.98]"
          >
            {t.contactKicker} <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      {/* ── Hero: name left, portrait right ─────────────────────────── */}
      <section className="px-gutter pt-14 pb-10 md:pt-20 md:pb-14">
        <div
          className="mx-auto grid items-end gap-10 md:grid-cols-12"
          style={{ maxWidth: "var(--atlas-shell)" }}
        >
          <div className="md:col-span-7">
            <Reveal>
              <p className="kicker mb-8">{t.role}</p>
            </Reveal>

            <h1 className="display text-[clamp(3rem,9vw,7.5rem)]">
              {(locale === "ar" ? [profile.nameAr.split(" ")[0], profile.nameAr.split(" ").slice(1).join(" ")] : base.hero.name).map(
                (line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ),
              )}
            </h1>

            <Reveal delay={120} className="mt-10 flex flex-wrap items-end gap-x-12 gap-y-6">
              <p className="lead max-w-[44ch]">{t.lead}</p>
              <a href="#work" className="link pb-1 text-[0.9375rem]">
                {t.cta} <span aria-hidden="true">↓</span>
              </a>
            </Reveal>
          </div>

          <Reveal delay={80} className="md:col-span-5">
            <figure className="overflow-hidden rounded-2xl bg-paper-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/media/film/portrait.webp"
                alt={locale === "ar" ? `صورة ${profile.nameAr}` : `${profile.name}, ${profile.role}`}
                width={1200}
                height={1500}
                loading="eager"
                decoding="async"
                className="aspect-4/5 w-full object-cover"
              />
              <figcaption className="flex items-center justify-between px-5 py-3.5">
                <span className="kicker">{locale === "ar" ? profile.locationAr : profile.location}</span>
                <span className="kicker">{profile.timezone}</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ── The statement ───────────────────────────────────────────── */}
      <section className="px-gutter py-16 md:py-24">
        <div className="mx-auto" style={{ maxWidth: "var(--atlas-shell)" }}>
          <WordReveal locale={locale} />
        </div>
      </section>

      {/* ── Work ────────────────────────────────────────────────────── */}
      <section id="work" className="px-gutter py-20 md:py-28">
        <div className="mx-auto" style={{ maxWidth: "var(--atlas-shell)" }}>
          <header className="mb-14 grid gap-6 md:mb-20 md:grid-cols-12">
            <Reveal className="md:col-span-7">
              <p className="kicker mb-6">{t.workKicker}</p>
              <h2 className="display text-[clamp(2rem,5.5vw,4.25rem)]">{t.workTitle}</h2>
            </Reveal>
            <Reveal delay={100} className="md:col-span-4 md:col-start-9 md:self-end">
              <p className="quiet">{t.workNote}</p>
            </Reveal>
          </header>

          <ol className="grid gap-4 md:grid-cols-3">
            {platforms[locale].map((platform, i) => {
              const Plate = PLATES[platform.id === "gh-store" ? "store" : platform.id === "bot-factory" ? "factory" : "bot"];
              return (
                <Reveal as="li" key={platform.id} delay={i * 90}>
                  <a
                    href={platform.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="card group block rounded-2xl p-7"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <span className="kicker">{platform.index}</span>
                      <span aria-hidden="true" className="text-ink-3 transition-colors duration-500 group-hover:text-rust">
                        ↗
                      </span>
                    </div>

                    <div className="mb-7 flex h-28 items-center justify-center rounded-xl bg-ink p-4">
                      <span className="scale-[2.1]">
                        <Plate label={platform.name} />
                      </span>
                    </div>

                    <h3 className="display-sm mb-2 text-[clamp(1.375rem,2.4vw,1.75rem)]">{platform.name}</h3>
                    <p className="kicker mb-4 normal-case tracking-normal">{platform.domain}</p>
                    <p className="text-[0.9375rem] leading-relaxed text-ink-2">{platform.headline}</p>
                  </a>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ── Record ──────────────────────────────────────────────────── */}
      <section id="record" className="px-gutter py-20 md:py-28">
        <div className="mx-auto" style={{ maxWidth: "var(--atlas-shell)" }}>
          <header className="mb-12 grid gap-6 md:mb-16 md:grid-cols-12">
            <Reveal className="md:col-span-8">
              <p className="kicker mb-6">{t.recordKicker}</p>
              <h2 className="display text-[clamp(1.875rem,4.5vw,3.5rem)]">{t.recordTitle}</h2>
            </Reveal>
          </header>

          <dl className="grid gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {t.record.map((item, i) => (
              <Reveal key={item.label} delay={i * 80}>
                <dt className="display mb-3 text-[clamp(2.5rem,6vw,4.5rem)] text-ink">{item.value}</dt>
                <dd className="max-w-[16ch] text-[0.875rem] leading-relaxed text-ink-3">{item.label}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Profile + accordion ──────────────────────────────────────── */}
      <section id="profile" className="px-gutter py-20 md:py-28">
        <div className="mx-auto grid gap-12 md:grid-cols-12" style={{ maxWidth: "var(--atlas-shell)" }}>
          <header className="md:col-span-5">
            <Reveal>
              <p className="kicker mb-6">{t.profileKicker}</p>
              <h2 className="display text-[clamp(1.75rem,4vw,3rem)]">{t.profileTitle}</h2>
            </Reveal>
            <div className="mt-8 space-y-5">
              {t.profileBody.map((paragraph, i) => (
                <Reveal key={paragraph.slice(0, 20)} delay={100 + i * 80}>
                  <p className="quiet">{paragraph}</p>
                </Reveal>
              ))}
            </div>
          </header>

          <div className="md:col-span-6 md:col-start-7">
            {t.accordions.map((row, i) => (
              <Reveal key={row.title} delay={i * 60}>
                <details className="group border-t border-ink/12 last:border-b" name="atlas-accordion">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-[1.0625rem] font-medium transition-colors duration-500 hover:text-rust">
                    {row.title}
                    <span aria-hidden="true" className="shrink-0 text-ink-3 transition-transform duration-500 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="quiet pb-7 pe-12">{row.body}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ─────────────────────────────────────────────────── */}
      <section id="contact" className="px-gutter pt-20 pb-14 md:pt-28 md:pb-20">
        <div className="mx-auto" style={{ maxWidth: "var(--atlas-shell)" }}>
          <Reveal>
            <p className="kicker mb-6">{t.contactKicker}</p>
            <h2 className="display max-w-[20ch] text-[clamp(2rem,5.5vw,4rem)] text-balance">
              {t.contactTitle}
            </h2>
          </Reveal>

          <Reveal delay={100} className="mt-14">
            <a
              href={`mailto:${profile.email}`}
              className="flex flex-wrap items-center justify-between gap-6 border-t border-ink/12 pt-8 text-[clamp(1.125rem,2.6vw,1.75rem)] transition-colors duration-500 hover:text-rust"
            >
              <span>{profile.email}</span>
              <span aria-hidden="true">↗</span>
            </a>

            <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              {[
                { href: profile.github, label: "GitHub" },
                { href: profile.linkedin, label: "LinkedIn" },
                { href: profile.telegramUrl, label: "Telegram" },
                { href: links.store, label: base.board.rows[0].label },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noreferrer noopener" : undefined}
                    className="link text-[0.9375rem]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

          <footer className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-ink/12 pt-8">
            <span className="kicker">
              © {new Date().getFullYear()} {name}
            </span>
            <span className="kicker">{base.footer.built}</span>
          </footer>
        </div>
      </section>
    </>
  );
}