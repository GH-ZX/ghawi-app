import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { profile, type Copy } from "@/lib/content";

export function About({ t }: { t: Copy["about"] }) {
  return (
    <section id="about" className="shell scroll-mt-28 py-24 lg:py-36">
      <Reveal>
        <h2 className="sect-label">
          <span className="text-acc">01</span>
          <span>{t.label}</span>
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-14 lg:grid-cols-12 lg:gap-12">
        {/* Text */}
        <div className="lg:col-span-7">
          <Reveal>
            <h3 className="max-w-[20ch] font-display text-[clamp(1.9rem,4.6vw,3.15rem)] leading-[1.06] font-medium tracking-[-0.035em] text-fg">
              {t.headline}
            </h3>
          </Reveal>

          <div className="mt-8 max-w-[58ch] space-y-5">
            {t.body.map((paragraph, index) => (
              <Reveal key={index} delay={80 + index * 70}>
                <p className="text-[15.5px] leading-[1.7] text-fg-2">{paragraph}</p>
              </Reveal>
            ))}
          </div>

          {/* Discipline list */}
          <Reveal delay={220} className="mt-12">
            <h4 className="eyebrow mb-5">{t.disciplineTitle}</h4>
            <dl className="border-t border-line">
              {t.discipline.map((item) => (
                <div
                  key={item.label}
                  className="group grid gap-1 border-b border-line py-4 transition-colors duration-300 hover:bg-bg-1 sm:grid-cols-[13rem_1fr] sm:gap-6 sm:px-3"
                >
                  <dt className="mono text-[12px] tracking-[0.06em] text-fg uppercase transition-colors duration-300 group-hover:text-acc">
                    {item.label}
                  </dt>
                  <dd className="text-[13.5px] leading-relaxed text-fg-3">{item.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* Portrait */}
        <Reveal delay={140} className="lg:col-span-5 lg:pt-16">
          <figure className="relative">
            <div className="relative aspect-4/5 overflow-hidden border border-line bg-bg-2">
              <Image
                src={profile.portrait}
                alt={profile.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-[50%_22%] grayscale-[0.55] contrast-[1.05] transition-[filter,transform] duration-700 hover:scale-[1.02] hover:grayscale-0"
              />
              {/* Scan tint */}
              <div
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(7,8,10,0.88)_0%,rgba(7,8,10,0.15)_42%,transparent_70%)]"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(212,255,63,0.09),transparent_60%)] mix-blend-screen"
                aria-hidden="true"
              />

              {/* Caption */}
              <figcaption className="mono absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-[10.5px] tracking-[0.1em] text-fg-2 uppercase">
                <span>
                  {profile.role.split(" · ")[0]}
                  <br />
                  <span className="text-fg-3">{profile.handle}</span>
                </span>
                <span className="flex items-center gap-1.5 text-acc">
                  <span className="pulse-dot" aria-hidden="true" />
                  {profile.location}
                </span>
              </figcaption>
            </div>
            <span className="corner-ticks pointer-events-none absolute -inset-px" aria-hidden="true" />
          </figure>
        </Reveal>
      </div>
    </section>
  );
}