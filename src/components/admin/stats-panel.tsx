"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/*
 * Admin → Stats: who came to ghawi.app and what they clicked, from the
 * site's own counters (/api/track). No cookies, no personal data — counts per
 * day. The admin's own visits are left out.
 */

type Row = { label: string; n: number };
type Stats = {
  days: number;
  since: string;
  daily: { day: string; n: number }[];
  pages: Row[];
  clicks: Row[];
  refs: Row[];
  countries: Row[];
  locales: Row[];
  messages: number;
};

const RANGES = [7, 30, 90] as const;

/** Button names as the page sets them (data-track), in words. */
const NAMES: Record<string, string> = {
  "hero-telegram": "Hero · Message on Telegram",
  "hero-whatsapp": "Hero · Message on WhatsApp",
  "hero-contact": "Hero · Start a conversation",
  "hero-bot": "Hero · Try my store bot",
  "hero-store": "Hero · GH Store is live",
  "header-cta": "Header · Let's talk",
  "nav-cv": "Header · CV",
  "tabbar-contact": "Phone tab bar · Contact",
  "store-site": "GH Store · Visit the store",
  "store-bot": "GH Store · Open the bot",
  "store-channel": "GH Store · Channel",
  "store-source": "GH Store · Source code",
  "contact-telegram": "Contact · Telegram",
  "contact-whatsapp": "Contact · WhatsApp",
  "contact-instagram": "Contact · Instagram",
  "contact-github": "Contact · GitHub",
  "contact-linkedin": "Contact · LinkedIn",
  "contact-email": "Contact · Email",
  "about-cv": "About · Read my CV",
  "footer-cv": "Footer · CV",
  "cv-pdf": "CV · Download PDF",
  "cv-print": "CV · Print",
  github: "More on GitHub · All repositories",
  "github-repo": "More on GitHub · a repository",
  "case-gh-store": "Case study · GH Store",
  "case-store-bot": "Case study · Store bot",
  "case-storefront": "Case study · Storefront",
  "case-store": "Case study · Visit the store",
  "case-bot": "Case study · Open the bot",
};

function nameOf(label: string): string {
  if (NAMES[label]) return NAMES[label];
  if (label.startsWith("cta-")) return `Button · ${label.slice(4)} (to the form)`;
  if (label.startsWith("service-")) return `Services · Start this · ${label.slice(8)}`;
  if (label.startsWith("footer-")) return `Footer · ${label.slice(7)}`;
  return label;
}

const COUNTRY = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;

function Bars({ rows, name = (label: string) => label, empty }: { rows: Row[]; name?: (label: string) => string; empty: string }) {
  if (!rows.length) return <p className="muted small">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.n), 1);
  return (
    <ul className="st__bars">
      {rows.slice(0, 12).map((row) => (
        <li key={row.label}>
          <span className="st__bar" style={{ width: `${(row.n / max) * 100}%` }} aria-hidden="true" />
          <span className="st__bar-label">{name(row.label)}</span>
          <span className="st__bar-n num">{row.n}</span>
        </li>
      ))}
    </ul>
  );
}

export function StatsPanel() {
  const router = useRouter();
  const [days, setDays] = useState<number>(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(`/api/admin/site/stats?days=${days}`, { signal: controller.signal, cache: "no-store" });
        if (response.status === 401) return router.refresh();
        if (!response.ok) throw new Error(String(response.status));
        setStats((await response.json()) as Stats);
        setError(false);
      } catch {
        if (!controller.signal.aborted) setError(true);
      }
    })();
    return () => controller.abort();
  }, [days, router]);

  const total = (rows: Row[] | undefined) => (rows ?? []).reduce((sum, row) => sum + row.n, 0);
  const visits = total(stats?.daily.map((d) => ({ label: d.day, n: d.n })));
  const chats = total(stats?.clicks.filter((c) => /telegram|whatsapp|email/.test(c.label)));
  const bot = total(stats?.clicks.filter((c) => /(^|-)bot$/.test(c.label)));

  // Every day in the range, quiet ones included, so the bars line up with time.
  const series: { day: string; n: number }[] = [];
  if (stats) {
    const byDay = new Map(stats.daily.map((d) => [d.day, d.n]));
    // Counted from the range's first day as the server set it, so a render never reads the clock.
    const start = Date.parse(`${stats.since}T00:00:00Z`);
    for (let i = 0; i < stats.days; i += 1) {
      const day = new Date(start + i * 86_400_000).toISOString().slice(0, 10);
      series.push({ day, n: byDay.get(day) ?? 0 });
    }
  }
  const peak = Math.max(1, ...series.map((d) => d.n));

  return (
    <section className="st" aria-labelledby="st-title">
      <div className="theme-panel__head">
        <div>
          <h2 id="st-title">Stats</h2>
          <p className="muted">Visits and clicks on ghawi.app, counted by the site itself. No cookies; your own visits are left out.</p>
        </div>
        <div className="seg" role="group" aria-label="Range">
          {RANGES.map((range) => (
            <button key={range} type="button" className="press" aria-pressed={days === range} onClick={() => setDays(range)}>
              {range} days
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="login__alert" role="alert">
          Couldn&apos;t load the stats. Refresh to try again.
        </p>
      ) : null}

      <dl className="kpis">
        <div className="kpi">
          <dt>Visits</dt>
          <dd className="num">{stats ? visits : "…"}</dd>
        </div>
        <div className="kpi">
          <dt>Messages from the form</dt>
          <dd className="num">{stats ? stats.messages : "…"}</dd>
        </div>
        <div className="kpi">
          <dt>Clicks to Telegram, WhatsApp, email</dt>
          <dd className="num">{stats ? chats : "…"}</dd>
        </div>
        <div className="kpi">
          <dt>Store bot opened</dt>
          <dd className="num">{stats ? bot : "…"}</dd>
        </div>
      </dl>

      <div className="card card--pad st__chart">
        <h3>Visits per day</h3>
        {stats ? (
          <div className="st__days" role="img" aria-label={`Visits per day over the last ${stats.days} days`}>
            {series.map((d) => (
              <span key={d.day} className="st__day" title={`${d.day}: ${d.n}`}>
                <span style={{ height: `${(d.n / peak) * 100}%` }} />
              </span>
            ))}
          </div>
        ) : (
          <div className="empty">
            <span className="spinner" aria-hidden="true" />
          </div>
        )}
        {stats ? (
          <p className="muted small st__axis">
            <span>{series[0]?.day}</span>
            <span>peak {peak}</span>
            <span>{series[series.length - 1]?.day}</span>
          </p>
        ) : null}
      </div>

      <div className="st__grid">
        <div className="card card--pad">
          <h3>What people clicked</h3>
          <Bars rows={stats?.clicks ?? []} name={nameOf} empty="No clicks yet." />
        </div>
        <div className="card card--pad">
          <h3>Pages</h3>
          <Bars rows={stats?.pages ?? []} empty="No visits yet." />
        </div>
        <div className="card card--pad">
          <h3>Came from</h3>
          <Bars rows={stats?.refs ?? []} empty="Nobody arrived from another site yet (direct visits aren't listed)." />
        </div>
        <div className="card card--pad">
          <h3>Countries</h3>
          <Bars rows={stats?.countries ?? []} name={(code) => COUNTRY?.of(code) ?? code} empty="No countries yet." />
        </div>
        <div className="card card--pad">
          <h3>Language</h3>
          <Bars rows={stats?.locales ?? []} name={(code) => (code === "ar" ? "Arabic page" : code === "en" ? "English page" : code)} empty="—" />
        </div>
      </div>
    </section>
  );
}
