import { copy, profile, type Locale } from "@/lib/content";

export function FilmFooter({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const year = new Date().getFullYear();

  return (
    <footer className="px-gutter pt-20 pb-10">
      <div
        className="mx-auto flex flex-col gap-10 border-t border-white/8 pt-10 md:flex-row md:items-end md:justify-between"
        style={{ maxWidth: "var(--film-shell)" }}
      >
        <div>
          <p className="display-sm mb-3 text-[clamp(1.5rem,3vw,2.25rem)]">
            {locale === "ar" ? profile.nameAr : profile.name}
          </p>
          <p className="max-w-[40ch] text-[0.8125rem] leading-relaxed font-light text-ivory-3">
            {t.footer.built}. © {year} {t.footer.rights}
          </p>
        </div>

        <ul className="flex flex-wrap gap-x-8 gap-y-3">
          {[
            { href: profile.github, label: "GitHub" },
            { href: profile.linkedin, label: "LinkedIn" },
            { href: profile.telegramUrl, label: "Telegram" },
            { href: `mailto:${profile.email}`, label: "Email" },
          ].map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer noopener" : undefined}
                className="text-[0.8125rem] font-light text-ivory-3 transition-colors duration-500 hover:text-ivory"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}