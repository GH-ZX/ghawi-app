import { LocaleSwitcher } from "@/components/locale-switcher";
import { copy, profile, type Locale } from "@/lib/content";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = copy[locale].footer;
  const year = 2026;

  const secondary = [
    { label: "GH Store", href: "https://gh-store.me" },
    { label: "Bot Factory", href: "https://factory.gh-store.me" },
    { label: "GitHub", href: profile.github },
    { label: "LinkedIn", href: profile.linkedin },
  ];

  return (
    <footer className="border-t border-line bg-bg-1">
      <div className="shell py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Identity */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="relative grid size-7 place-items-center border border-line-2 bg-bg font-mono text-[11px] text-fg">
                GH
                <span className="absolute -end-px -bottom-px size-1.5 bg-acc" />
              </span>
              <span className="mono text-xs tracking-[0.14em] text-fg-2 uppercase">
                ghawi<span className="text-fg-3">.app</span>
              </span>
            </div>

            <p className="mono mt-4 max-w-[38ch] text-[11px] leading-relaxed text-fg-3">
              {profile.name} — {profile.role}
            </p>
            <p className="mono mt-1 text-[11px] text-fg-3">{t.built}</p>
          </div>

          {/* Links */}
          <nav aria-label="Footer" className="flex flex-col gap-6 sm:flex-row sm:gap-16">
            <ul className="space-y-2.5">
              {secondary.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono text-[12px] text-fg-2 transition-colors duration-200 hover:text-acc"
                  >
                    {item.label} ↗
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-4">
              <LocaleSwitcher locale={locale} />
              <a
                href="#top"
                className="mono text-[12px] text-fg-3 transition-colors duration-200 hover:text-acc"
              >
                ↑ {t.backToTop}
              </a>
            </div>
          </nav>
        </div>

        <div className="mono mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-[10.5px] tracking-[0.1em] text-fg-3 uppercase">
          <span>
            © {year} {profile.name}. {t.rights}
          </span>
          <span className="flex items-center gap-2">
            <span className="pulse-dot scale-75" aria-hidden="true" />
            all systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}