import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";
import { profile, type Copy, type Locale } from "@/lib/content";

const CHANNEL_HREF: Record<string, string> = {
  email: `mailto:${profile.email}`,
  telegram: profile.telegramUrl,
  whatsapp: profile.whatsappUrl,
  github: profile.github,
  linkedin: profile.linkedin,
};

export function Contact({ t, locale }: { t: Copy["contact"]; locale: Locale }) {
  return (
    <section id="contact" className="relative isolate scroll-mt-28 overflow-hidden border-t border-line">
      <div className="dot-field pointer-events-none absolute inset-0 -z-10 opacity-40" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-64 bg-[radial-gradient(70%_100%_at_50%_100%,rgba(212,255,63,0.07),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="shell py-24 lg:py-36">
        <Reveal>
          <h2 className="sect-label">
            <span className="text-acc">05</span>
            <span>{t.label}</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-14 lg:grid-cols-12 lg:gap-10">
          {/* Headline + email */}
          <div className="lg:col-span-7">
            <Reveal delay={60}>
              <h3 className="max-w-[15ch] font-display text-[clamp(2.1rem,6.2vw,4.25rem)] leading-[0.98] font-medium tracking-[-0.042em] text-fg">
                {t.headline}
              </h3>
            </Reveal>

            <Reveal delay={120}>
              <p className="mt-7 max-w-[46ch] text-[15px] leading-[1.7] text-fg-2">{t.body}</p>
            </Reveal>

            <Reveal delay={180}>
              <a
                href={`mailto:${profile.email}`}
                className="group mt-10 flex items-center gap-4"
              >
                <span className="mono text-[clamp(1.05rem,3.2vw,1.9rem)] tracking-[-0.02em] break-all text-fg underline decoration-acc/50 decoration-2 underline-offset-[6px] transition-colors duration-300 group-hover:text-acc group-hover:decoration-acc">
                  {profile.email}
                </span>
                <span
                  className="mono text-sm text-fg-3 transition-colors duration-300 group-hover:text-acc"
                  aria-hidden="true"
                >
                  ↗
                </span>
              </a>
            </Reveal>

            <Reveal delay={240}>
              <ContactForm t={t.form} locale={locale} />
            </Reveal>
          </div>

          {/* Channels */}
          <div className="lg:col-span-5 lg:pt-4">
            <Reveal delay={140}>
              <ul className="border-t border-line">
                {t.channels.map((channel) => (
                  <li key={channel.id} className="border-b border-line">
                    <a
                      href={CHANNEL_HREF[channel.id]}
                      target={channel.id === "email" ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-4 py-4 transition-colors duration-300"
                    >
                      <span className="mono text-[11px] tracking-[0.14em] text-fg-3 uppercase">
                        {channel.label}
                      </span>
                      <span className="flex items-center gap-3 text-[13.5px] text-fg-2 transition-colors duration-300 group-hover:text-acc">
                        <span className="mono">{channel.value}</span>
                        <span
                          className="text-fg-3 transition-opacity duration-300 group-hover:opacity-100 group-hover:text-acc"
                          aria-hidden="true"
                        >
                          ↗
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={220} className="mt-8">
              <p className="mono flex items-center gap-2 text-[10.5px] tracking-[0.12em] text-fg-3 uppercase">
                <span className="pulse-dot scale-75" aria-hidden="true" />
                {profile.timezone} · {profile.location}
              </p>
            </Reveal>

            <Reveal delay={280} className="mt-6 border border-line bg-bg-1 p-5">
              <p className="mono text-[10.5px] tracking-[0.14em] text-fg-3 uppercase">
                {t.fallback}
              </p>
              <a
                href={`mailto:${profile.email}`}
                className="mono mt-2 inline-flex items-center gap-2 text-[13px] text-fg transition-colors duration-200 hover:text-acc"
              >
                {profile.email}
                <span aria-hidden="true">↗</span>
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}