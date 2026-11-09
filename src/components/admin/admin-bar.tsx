"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalIcon, MoonIcon, SunIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { ADMIN_SECTIONS, type AdminSection } from "@/lib/admin-sections";
import { GH_CASH_ADMIN_URL } from "@/lib/home-links";
import { getEffectiveMode, setMode } from "@/lib/theme-client";

/**
 * The admin's top bar, on /admin and /admin/other: the brand, light/dark, the
 * other admins this one sits beside (GH-Cash has its own sign-in), the site,
 * and sign out.
 */
export function AdminBar({ where }: { where: string }) {
  const router = useRouter();

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <header className="admin__bar">
      <div className="admin__bar-inner">
        <Link className="admin__brand" href="/admin">
          <Logo height={20} />
          ghawi.app <span>/ {where}</span>
        </Link>
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
          <a
            className="btn btn--xs btn--ghost press"
            href={GH_CASH_ADMIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="GH-Cash admin (its own sign-in)"
          >
            GH-Cash <ExternalIcon size={14} />
          </a>
          <a className="btn btn--xs btn--ghost press admin__site" href="/en" target="_blank" rel="noopener noreferrer">
            Site <ExternalIcon size={14} />
          </a>
          <button type="button" className="btn btn--xs btn--soft press" onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

/**
 * The admin's sections. On /admin they switch in place (`onPick`); on
 * /admin/other they are links back. "Other" holds what is rarely needed now:
 * the wedding invitation's settings.
 */
export function AdminTabs({
  current,
  onPick,
  unread = 0,
}: {
  current: AdminSection | "other";
  onPick?: (section: AdminSection) => void;
  unread?: number;
}) {
  return (
    <nav className="seg admin__tabs" aria-label="Section">
      {ADMIN_SECTIONS.map((tab) => {
        const label = tab.id === "inbox" && unread ? `${tab.label} · ${unread}` : tab.label;
        return onPick ? (
          <button key={tab.id} type="button" className="press" aria-pressed={current === tab.id} onClick={() => onPick(tab.id)}>
            {label}
          </button>
        ) : (
          <Link key={tab.id} className="press" href={tab.id === "inbox" ? "/admin" : `/admin?tab=${tab.id}`}>
            {label}
          </Link>
        );
      })}
      <Link className="press" href="/admin/other" aria-current={current === "other" ? "true" : undefined}>
        Other
      </Link>
    </nav>
  );
}
