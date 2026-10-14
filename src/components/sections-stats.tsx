import { Reveal } from "@/components/reveal";
import type { Copy } from "@/lib/content";

export function Stats({ t }: { t: Copy["stats"] }) {
  return (
    <section aria-label="At a glance">
      {/* Hairline dividers come from gap-px over a line-coloured ground,
          which stays correct in both writing directions. */}
      <dl className="grid grid-cols-2 gap-px border-y border-line bg-line lg:grid-cols-4">
        {t.map((stat, index) => (
          <Reveal
            key={stat.label}
            delay={index * 70}
            className="bg-bg px-5 py-8 transition-colors duration-500 hover:bg-bg-1 lg:px-8 lg:py-10"
          >
            <dt className="sr-only">{stat.label}</dt>
            <dd>
              <span className="block font-display text-[clamp(1.9rem,4.4vw,2.9rem)] leading-none font-medium tracking-[-0.04em] text-fg">
                {stat.value}
              </span>
              <span className="mt-3 block text-[12.5px] leading-snug text-fg-3">
                {stat.label}
              </span>
            </dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}