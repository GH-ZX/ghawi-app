import { Logo } from "@/components/logo";
import { links, profile, type Dictionary, type Locale } from "@/lib/content";
import { LocalTime, ModeSeg, SyncedPreset } from "./footer-controls";

export function Footer({ t, locale }: { t: Dictionary; locale: Locale }) {
  const year = new Date().getFullYear();
  const outbound = [
    { label: "GH Store", href: links.store },
    { label: "GitHub", href: profile.github },
    { label: "Telegram", href: profile.telegramUrl },
    { label: "LinkedIn", href: profile.linkedin },
  ];

  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo height={24} />
            <p>
              {locale === "ar" ? profile.nameAr : profile.name} — {profile.role[locale]}. {t.footer.built}
            </p>
          </div>

          <ul className="footer__links">
            {outbound.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                  <span className="sr-only"> {t.ui.newTab}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="footer__controls">
            <span className="contact__label">{t.ui.appearance}</span>
            <ModeSeg ui={t.ui} />
          </div>
        </div>

        <div className="footer__bottom">
          <span>
            © {year} {profile.name}. {t.footer.rights}
          </span>
          <span className="footer__meta">
            <SyncedPreset synced={t.footer.synced} theme={t.footer.theme} locale={locale} />
            <LocalTime label={t.footer.localTime} timeZone={profile.timeZone} />
            <a className="footer__top-link" href="#top">
              {t.footer.top} ↑
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
