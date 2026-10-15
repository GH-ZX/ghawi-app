import { copy, repos as allRepos, type Locale } from "@/lib/content";
import { Reveal } from "./reveal";

/**
 * Selected repositories, set as wide quiet rows rather than a grid of cards.
 * No thumbnails, no borders — the name carries the row at display scale and
 * everything else stays secondary.
 */
export function Code({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const items = allRepos[locale];

  return (
    <section id="code" className="px-gutter py-28 md:py-40">
      <div className="mx-auto" style={{ maxWidth: "var(--film-shell)" }}>
        <Reveal className="mb-16 md:mb-24">
          <p className="label mb-6">{t.code.label}</p>
          <h2 className="display-sm text-[clamp(2rem,5vw,3.75rem)]">{t.code.headline}</h2>
        </Reveal>

        <ul>
          {items.map((repo, i) => (
            <Reveal as="li" key={repo.name} delay={Math.min(i, 5) * 60}>
              <a
                href={repo.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group grid gap-x-8 gap-y-3 rounded-2xl px-4 py-8 transition-colors duration-700 hover:bg-white/[0.035] md:grid-cols-12 md:px-6 md:py-10"
              >
                <h3 className="display-sm text-[clamp(1.5rem,3.4vw,2.5rem)] transition-colors duration-700 group-hover:text-beam md:col-span-5">
                  {repo.name}
                </h3>

                <div className="flex items-center gap-3 md:col-span-2 md:col-start-7 md:flex-col md:items-start md:gap-2">
                  <span className="label">{repo.language}</span>
                  <span className="text-[0.75rem] font-light text-ivory-3 md:hidden">
                    {repo.type}
                  </span>
                </div>

                <p className="body-quiet text-[0.9375rem] md:col-span-3 md:col-start-10 md:self-center">
                  {repo.blurb}
                </p>

                <span className="label hidden md:col-span-1 md:col-start-12 md:self-center md:justify-self-end md:block">
                  ↗
                </span>
              </a>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={120} className="mt-14">
          <a
            href="https://github.com/GH-ZX"
            target="_blank"
            rel="noreferrer noopener"
            className="pill"
          >
            {t.code.all}
            <span data-disc aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
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
        </Reveal>
      </div>
    </section>
  );
}