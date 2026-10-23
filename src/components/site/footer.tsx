import { Logo } from "@/components/logo";
import { cvHref } from "@/lib/content";
import type { PageContext } from "@/lib/site-content";
import { LocalTime, ModeSeg, SyncedPreset } from "./footer-controls";
import { Looks } from "./looks";

export function Footer({ ctx }: { ctx: PageContext }) {
  const { t, locale, profile, links, settings, urls } = ctx;
  const year = new Date().getFullYear();
  const outbound = [
    { label: "GH Store", href: links.store, track: "footer-store" },
    { label: "@" + links.storeBot.replace(/\/+$/, "").split("/").pop(), href: links.storeBot, track: "footer-bot" },
    { label: "Telegram", href: urls.telegram, track: "footer-telegram" },
    { label: "Instagram", href: profile.instagram ? urls.instagram : "", track: "footer-instagram" },
    { label: "GitHub", href: urls.github, track: "footer-github" },
    { label: "LinkedIn", href: urls.linkedin, track: "footer-linkedin" },
  ].filter((link) => link.href);

  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo height={24} />
            <p>
              {locale === "ar" ? profile.nameAr : profile.name} — {t.person.role}. {t.footer.built}
            </p>
            <a className="btn btn--xs btn--soft press" href={cvHref(locale)} data-track="footer-cv">
              {t.nav.cv}
            </a>
          </div>

          <ul className="footer__links">
            {outbound.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" data-track={link.track}>
                  <bdi>{link.label}</bdi>
                  <span className="sr-only"> {t.ui.newTab}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="footer__controls">
            <span className="contact__label">{t.ui.appearance}</span>
            <ModeSeg ui={t.ui} />
            {settings.looks ? <Looks looks={t.footer.looks} locale={locale} /> : null}
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
