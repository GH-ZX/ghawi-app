import { Reveal } from "@/components/reveal";
import type { Copy } from "@/lib/content";

export function Capabilities({ t }: { t: Copy["capabilities"] }) {
  return (
    <section id="capabilities" className="scroll-mt-28 border-t border-line">
      <div className="shell py-24 lg:py-36">
        <Reveal>
          <h2 className="sect-label">
            <span className="text-acc">04</span>
            <span>{t.label}</span>
          </h2>
        </Reveal>

        <Reveal delay={60}>
          <h3 className="mt-10 max-w-[16ch] font-display text-[clamp(1.9rem,4.6vw,3.15rem)] leading-[1.06] font-medium tracking-[-0.035em] text-fg">
            {t.headline}
          </h3>
        </Reveal>

        <ol className="mt-16 grid gap-px border border-line bg-line md:grid-cols-2 xl:grid-cols-3">
          {t.items.map((item, index) => (
            <Reveal
              key={item.index}
              as="li"
              delay={index * 65}
              className="group relative flex flex-col bg-bg p-7 transition-colors duration-500 hover:bg-bg-1 sm:p-8"
            >
              <span
                className="mono text-[11px] tracking-[0.16em] text-acc"
                aria-hidden="true"
              >
                {item.index}
              </span>

              <h4 className="mt-6 max-w-[20ch] font-display text-[1.28rem] leading-[1.2] font-medium tracking-[-0.02em] text-fg">
                {item.title}
              </h4>

              <p className="mt-3.5 text-[13.5px] leading-[1.7] text-fg-3">{item.body}</p>

              {/* Index ghost numeral */}
              <span
                className="mono pointer-events-none absolute -end-3 -bottom-5 text-[4.5rem] leading-none font-medium text-fg/[0.025] transition-colors duration-500 group-hover:text-acc/[0.06]"
                aria-hidden="true"
              >
                {item.index}
              </span>
            </Reveal>
          ))}

          {/* Filler cell: an empty grid track would show the line colour
              through the gap-px background, so keep it opaque. */}
          <li className="hidden bg-bg md:block" aria-hidden="true" />
        </ol>
      </div>
    </section>
  );
}