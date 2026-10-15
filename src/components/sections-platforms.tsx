import { BotVisual, FactoryVisual, StoreVisual } from "@/components/platform-visuals";
import { Reveal } from "@/components/reveal";
import { platforms, type Copy, type Locale, type Platform } from "@/lib/content";

/**
 * One visual per platform id. An unknown id renders nothing rather than
 * silently falling through to the wrong diagram.
 */
function Visual({ platform }: { platform: Platform }) {
  switch (platform.id) {
    case "gh-store":
      return <StoreVisual url={platform.domain} />;
    case "bot-factory":
      return <FactoryVisual />;
    case "store-bot":
      return <BotVisual handle={platform.domain} />;
    default:
      return null;
  }
}

function Card({
  platform,
  t,
  reversed,
}: {
  platform: Platform;
  t: Copy["platforms"];
  /** Alternate the narrative/visual order so the stack never reads as a list. */
  reversed: boolean;
}) {
  return (
    <Reveal className="relative">
      <article className="group relative border border-line bg-bg-1/40 transition-colors duration-500 hover:border-line-2">
        {/* Hover wash */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            // Token-driven so each theme washes in its own accent rather than
            // baking one theme's lime into every card.
            backgroundImage:
              "radial-gradient(100% 55% at 50% 0%, color-mix(in oklab, var(--acc) 9%, transparent), transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="grid gap-0 lg:grid-cols-2">
          {/* ── Narrative ── */}
          <div className={`flex flex-col p-6 sm:p-9 ${reversed ? "lg:order-2" : ""}`}>
            {/* Header row */}
            <div className="flex items-center justify-between gap-4">
              <span className="mono text-[11px] tracking-[0.16em] text-acc">{platform.index}</span>
              <span className="mono flex items-center gap-1.5 text-[10px] tracking-[0.12em] text-fg-3 uppercase">
                <span className="pulse-dot scale-75" aria-hidden="true" />
                {platform.category}
              </span>
            </div>

            <h4 className="mt-6 font-display text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.02] font-medium tracking-[-0.035em] text-fg">
              {platform.name}
            </h4>

            <a
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mono mt-2.5 inline-flex w-fit items-center gap-1.5 text-[12px] text-fg-3 underline-offset-4 transition-colors duration-200 hover:text-acc hover:underline"
            >
              {platform.domain}
              <span aria-hidden="true">↗</span>
            </a>

            <p className="mt-6 max-w-[46ch] text-[15px] leading-[1.6] font-medium text-fg">
              {platform.headline}
            </p>

            <p className="mt-4 max-w-[52ch] text-[14px] leading-[1.7] text-fg-2">{platform.body}</p>

            {/* Feature list */}
            <dl className="mt-8 grid gap-x-8 gap-y-0 sm:grid-cols-2">
              {platform.features.map((feature) => (
                <div key={feature.label} className="border-b border-line py-3">
                  <dt className="mono text-[10.5px] tracking-[0.12em] text-acc/90 uppercase">
                    {feature.label}
                  </dt>
                  <dd className="mt-1 text-[12.5px] leading-snug text-fg-3">{feature.value}</dd>
                </div>
              ))}
            </dl>

            {/* Stack */}
            <ul className="mt-7 flex flex-wrap gap-1.5">
              {platform.stack.map((tech) => (
                <li
                  key={tech}
                  className="mono rounded-sm border border-line px-2.5 py-1 text-[10.5px] text-fg-3 transition-colors duration-300 group-hover:border-line-2 group-hover:text-fg-2"
                >
                  {tech}
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-2.5">
              <a
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="sweep mono inline-flex h-10 items-center gap-2 border border-line-2 px-5 text-[11px] tracking-[0.12em] text-fg uppercase transition-colors duration-200 hover:text-bg"
              >
                <span className="relative z-10">{t.visit}</span>
                <span className="relative z-10" aria-hidden="true">
                  ↗
                </span>
              </a>
              {platform.source ? (
                <a
                  href={platform.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono inline-flex h-10 items-center border border-line px-5 text-[11px] tracking-[0.12em] text-fg-3 uppercase transition-colors duration-200 hover:border-acc hover:text-acc"
                >
                  {t.source}
                </a>
              ) : null}
            </div>
          </div>

          {/* ── Visual ── */}
          <div
            className={`relative flex items-center justify-center border-line bg-[radial-gradient(120%_80%_at_50%_0%,rgba(255,255,255,0.035),transparent_70%)] p-6 sm:p-9 lg:border-s ${
              reversed ? "lg:order-1" : ""
            }`}
          >
            <div className="w-full max-w-[25rem] transition-transform duration-700 group-hover:-translate-y-1">
              <Visual platform={platform} />
            </div>
          </div>
        </div>

        <span className="corner-ticks pointer-events-none absolute -inset-px" aria-hidden="true" />
      </article>
    </Reveal>
  );
}

export function Platforms({ t, locale }: { t: Copy["platforms"]; locale: Locale }) {
  return (
    <section id="platforms" className="scroll-mt-28 border-t border-line py-24 lg:py-36">
      <div className="shell">
        <Reveal>
          <h2 className="sect-label">
            <span className="text-acc">02</span>
            <span>{t.label}</span>
          </h2>
        </Reveal>

        <Reveal delay={60}>
          <h3 className="mt-10 max-w-[18ch] font-display text-[clamp(1.9rem,4.6vw,3.15rem)] leading-[1.06] font-medium tracking-[-0.035em] text-fg">
            {t.headline}
          </h3>
        </Reveal>

        <div className="mt-14 space-y-6 lg:space-y-8">
          {platforms[locale].map((platform, i) => (
            <Card key={platform.id} platform={platform} t={t} reversed={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}