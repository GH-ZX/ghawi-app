import { PropertiesBoard } from "@/components/properties-board";
import { profile, type Copy } from "@/lib/content";

export function Hero({ t }: { t: Copy }) {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-[var(--nav-h)] pb-16">
      {/* Atmosphere */}
      <div className="grid-lines pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-40 inset-x-0 mx-auto -z-10 size-[46rem] rounded-full bg-[radial-gradient(closest-side,rgba(212,255,63,0.09),transparent)] blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-56 bg-gradient-to-t from-bg to-transparent"
        aria-hidden="true"
      />

      <div className="shell grid w-full items-end gap-14 lg:grid-cols-12 lg:gap-10">
        {/* ── Left: identity ─────────────────────────────────────── */}
        <div className="lg:col-span-7 xl:col-span-7">
          {/* Kicker */}
          <div className="mono mb-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] tracking-[0.16em] text-fg-3 uppercase">
            <span>{t.hero.kicker}</span>
            <span className="h-px w-10 bg-line-2" aria-hidden="true" />
            <span className="flex items-center gap-2 text-fg-2">
              <span className="pulse-dot" aria-hidden="true" />
              {t.board.live}
            </span>
            <span className="h-px w-10 bg-line-2" aria-hidden="true" />
            <span>{profile.timezone}</span>
          </div>

          {/* Name */}
          <h1 className="font-display text-[clamp(3.1rem,13.5vw,9.5rem)] leading-[0.85] font-medium tracking-[-0.045em]">
            <span className="block">{t.hero.name[0]}</span>
            <span className="relative block text-fg-2">
              {t.hero.name[1]}
              <span
                className="absolute -bottom-1 start-0 h-[3px] w-full bg-acc"
                aria-hidden="true"
              />
            </span>
          </h1>

          {/* Role */}
          <p className="mono mt-7 text-[12.5px] tracking-[0.1em] text-fg-2 uppercase">
            {t.hero.role}
          </p>

          {/* Lead */}
          <p className="mt-6 max-w-[54ch] text-[15.5px] leading-[1.65] text-fg-2 lg:text-base">
            {t.hero.lead}
          </p>

          {/* Actions */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#platforms"
              className="group mono inline-flex h-12 items-center gap-3 bg-acc px-7 text-[12px] font-medium tracking-[0.12em] text-bg uppercase transition-[background-color,transform] duration-200 hover:bg-white active:translate-y-px"
            >
              {t.hero.primary}
              <span
                className="transition-transform duration-200 group-hover:translate-y-0.5"
                aria-hidden="true"
              >
                ↓
              </span>
            </a>
            <a
              href="#contact"
              className="mono inline-flex h-12 items-center border border-line-2 px-7 text-[12px] tracking-[0.12em] text-fg uppercase transition-colors duration-200 hover:border-acc hover:text-acc"
            >
              {t.hero.secondary}
            </a>
          </div>
        </div>

        {/* ── Right: board ──────────────────────────────────────── */}
        <div className="lg:col-span-5 xl:col-span-4 xl:col-start-9">
          <PropertiesBoard t={t.board} />
        </div>
      </div>

      {/* Scroll cue */}
      <div className="shell pointer-events-none absolute inset-x-0 bottom-6 hidden lg:block">
        <div className="flex items-center gap-3">
          <span className="eyebrow">{t.hero.scroll}</span>
          <span className="relative h-8 w-px overflow-hidden bg-line-2" aria-hidden="true">
            <span className="absolute inset-x-0 top-0 h-3 animate-[scroll-cue_2.2s_ease-in-out_infinite] bg-acc" />
          </span>
          <span className="eyebrow">{profile.location}</span>
        </div>
      </div>
    </section>
  );
}