import { Reveal } from "@/components/reveal";
import { repos, type Copy, type Locale } from "@/lib/content";

export function Code({ t, locale }: { t: Copy["code"]; locale: Locale }) {
  const rows = repos[locale];

  return (
    <section id="code" className="shell scroll-mt-28 border-t border-line py-24 lg:py-36">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div>
          <Reveal>
            <h2 className="sect-label">
              <span className="text-acc">03</span>
              <span>{t.label}</span>
            </h2>
          </Reveal>
          <Reveal delay={60}>
            <h3 className="mt-10 max-w-[15ch] font-display text-[clamp(1.9rem,4.6vw,3.15rem)] leading-[1.06] font-medium tracking-[-0.035em] text-fg">
              {t.headline}
            </h3>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <a
            href="https://github.com/GH-ZX"
            target="_blank"
            rel="noopener noreferrer"
            className="mono group inline-flex items-center gap-2 text-[11.5px] tracking-[0.1em] text-fg-2 uppercase transition-colors duration-200 hover:text-acc"
          >
            {t.all}
            <span className="opacity-50 transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true">
              ↗
            </span>
          </a>
        </Reveal>
      </div>

      {/* Header row — desktop only */}
      <div className="mono mt-14 hidden grid-cols-[minmax(0,15rem)_8rem_9rem_minmax(0,1fr)_6rem] gap-6 border-b border-line-2 pb-3 text-[10px] tracking-[0.16em] text-fg-3 uppercase lg:grid">
        <span>{t.column.repo}</span>
        <span>{t.column.lang}</span>
        <span>{t.column.type}</span>
        <span>{t.column.about}</span>
        <span />
      </div>

      <ul className="border-t border-line lg:border-t-0">
        {rows.map((repo, index) => (
          <Reveal
            key={repo.name}
            as="li"
            delay={index * 55}
            className="group relative border-b border-line"
          >
            {/* Accent sweep on hover */}
            <span
              className="absolute inset-y-0 start-0 w-px scale-y-0 bg-acc transition-transform duration-300 group-hover:scale-y-100"
              aria-hidden="true"
            />

            {/*
              The row is one link, stretched over the whole cell via ::after.
              A repo may also have a live site — that is a *separate* anchor,
              nested outside this one, because anchors cannot nest.
            */}
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="-mx-3 grid gap-x-6 gap-y-2 px-3 py-5 transition-colors duration-300 after:absolute after:inset-0 after:content-[''] hover:bg-bg-1 lg:grid-cols-[minmax(0,15rem)_8rem_9rem_minmax(0,1fr)_6rem] lg:items-baseline"
            >
              <span className="mono flex items-center gap-2 text-[13px] text-fg">
                <span className="text-fg-2 transition-colors duration-300 group-hover:text-acc">
                  /
                </span>
                {repo.name}
                {repo.stars ? (
                  <span className="mono ml-1 text-[10px] text-fg-3" aria-label={`${repo.stars} star`}>
                    ★ {repo.stars}
                  </span>
                ) : null}
              </span>

              <span className="mono text-[11px] text-fg-3">{repo.language}</span>
              <span className="text-[12px] text-fg-3">{repo.type}</span>

              <span className="text-[13.5px] leading-relaxed text-fg-2 transition-colors duration-300 group-hover:text-fg">
                {repo.blurb}
              </span>
            </a>

            {repo.liveUrl ? (
              <a
                href={repo.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mono relative z-10 inline-flex w-fit items-center gap-1.5 border border-line px-2.5 py-1 text-[10px] tracking-[0.12em] text-fg-3 uppercase transition-colors duration-200 hover:border-acc hover:text-acc lg:absolute lg:end-3 lg:top-1/2 lg:-translate-y-1/2"
              >
                live
                <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </Reveal>
        ))}
      </ul>
    </section>
  );
}