"use client";

import { useRouter } from "next/navigation";
import { ExternalIcon, MoonIcon, ServiceIcon, SunIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { HOME_SERVICES } from "@/lib/home-links";
import { getEffectiveMode, setMode } from "@/lib/theme-client";

const host = (href: string) => new URL(href).host + new URL(href).pathname.replace(/\/$/, "");

/** home.ghawi.app: a card per ghawi service, each opening in its own tab. */
export function HomeConsole() {
  const router = useRouter();

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="admin">
      <header className="admin__bar">
        <div className="admin__bar-inner">
          <span className="admin__brand">
            <Logo height={20} />
            home <span>/ ghawi services</span>
          </span>
          <div className="admin__actions">
            <button
              type="button"
              className="icon-btn press"
              onClick={() => setMode(getEffectiveMode() === "dark" ? "light" : "dark")}
              aria-label="Toggle light and dark"
            >
              <span className="when-light">
                <MoonIcon />
              </span>
              <span className="when-dark">
                <SunIcon />
              </span>
            </button>
            <button type="button" className="btn btn--xs btn--soft press" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="admin__main">
        <ul className="home-grid">
          {HOME_SERVICES.map((service) => (
            <li key={service.name} className="home-card">
              <a className="home-card__main press" href={service.href} target="_blank" rel="noopener noreferrer">
                <span className="home-card__icon" aria-hidden="true">
                  <ServiceIcon name={service.icon} size={22} />
                </span>
                <span className="home-card__text">
                  <span className="home-card__name">
                    {service.name} <ExternalIcon size={14} />
                  </span>
                  <span className="home-card__host">{host(service.href)}</span>
                  <span className="home-card__about">{service.about}</span>
                </span>
              </a>
              {service.more?.length ? (
                <div className="home-card__more">
                  {service.more.map((link) => (
                    <a key={link.href} className="btn btn--xs btn--ghost press" href={link.href} target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
