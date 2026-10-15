"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Message = {
  id: number;
  created_at: string;
  name: string;
  email: string;
  topic: string | null;
  message: string;
  locale: string | null;
  ip: string | null;
  user_agent: string | null;
  notified: number;
  archived: number;
};

type Stats = { total: number; unread: number; undelivered: number };

type Tab = "inbox" | "settings" | "system";

const TABS: { id: Tab; label: string }[] = [
  { id: "inbox", label: "Inbox" },
  { id: "settings", label: "Settings" },
  { id: "system", label: "System" },
];

const THEMES = [
  {
    id: "nocturne",
    name: "Nocturne",
    note: "Near-black, lime signal. The default engineering look.",
    swatch: ["#07080a", "#151a1f", "#d4ff3f"],
  },
  {
    id: "paper",
    name: "Paper",
    note: "Warm off-white, ink type, deep amber. Editorial and calm.",
    swatch: ["#faf8f4", "#ebe7df", "#6b4d00"],
  },
  {
    id: "ember",
    name: "Ember",
    note: "Forge-warm black, molten copper, slow ambient drift.",
    swatch: ["#0c0907", "#241a15", "#ff8a3d"],
  },
] as const;

export function AdminConsole() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("inbox");

  const [messages, setMessages] = useState<Message[] | null>(null);
  const [stats, setStats] = useState<Stats>({ total: 0, unread: 0, undelivered: 0 });
  const [loadError, setLoadError] = useState<string | null>(null);

  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsState, setSettingsState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/messages");
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!response.ok) throw new Error("request_failed");
      const body = (await response.json()) as { messages?: Message[]; stats?: Stats };
      setMessages(body.messages ?? []);
      setStats(body.stats ?? { total: 0, unread: 0, undelivered: 0 });
      setLoadError(null);
    } catch {
      setLoadError("Could not load messages.");
    }
  }, [router]);

  useEffect(() => {
    // Kick both loads off. State is only touched inside the async
    // continuations, never synchronously in the effect body.
    const controller = new AbortController();

    void (async () => {
      try {
        const response = await fetch("/api/admin/messages", { signal: controller.signal });
        if (response.status === 401) {
          router.replace("/admin/login");
          return;
        }
        if (!response.ok) throw new Error("request_failed");
        const body = (await response.json()) as { messages?: Message[]; stats?: Stats };
        setMessages(body.messages ?? []);
        setStats(body.stats ?? { total: 0, unread: 0, undelivered: 0 });
        setLoadError(null);
      } catch {
        if (controller.signal.aborted) return;
        setLoadError("Could not load messages.");
      }

      try {
        const response = await fetch("/api/admin/settings", { signal: controller.signal });
        if (response.status === 401) {
          router.replace("/admin/login");
          return;
        }
        const body = (await response.json()) as { settings?: Record<string, string> };
        setSettings(body.settings ?? {});
      } catch {
        if (controller.signal.aborted) return;
      }
    })();

    return () => controller.abort();
  }, [router]);

  async function archive(id: number, archived: boolean) {
    setMessages((current) =>
      current
        ? current.map((m) => (m.id === id ? { ...m, archived: archived ? 1 : 0 } : m))
        : current,
    );
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, archived }),
    });
    void loadMessages();
  }

  async function remove(id: number) {
    if (!confirm("Delete this message permanently?")) return;
    setMessages((current) => current?.filter((m) => m.id !== id) ?? null);
    await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" });
    void loadMessages();
  }

  async function saveSettings(patch: Record<string, unknown>) {
    setSettingsState("saving");
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSettingsState(response.ok ? "saved" : "error");
    if (!response.ok) setTimeout(() => setSettingsState("idle"), 2500);
    else setTimeout(() => setSettingsState("idle"), 1800);
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-svh">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-5">
          <span className="mono text-xs tracking-[0.14em] text-fg-2 uppercase">
            ghawi<span className="text-fg-3">.app</span>
            <span className="text-fg-3"> / admin</span>
          </span>

          <nav className="flex items-center gap-1" aria-label="Sections">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-current={tab === item.id ? "page" : undefined}
                className={`px-3 py-1.5 text-[13px] transition-colors ${
                  tab === item.id ? "text-acc" : "text-fg-3 hover:text-fg"
                }`}
              >
                {item.label}
                {item.id === "inbox" && stats.unread > 0 ? (
                  <span className="mono ms-1.5 text-[10px] text-acc">{stats.unread}</span>
                ) : null}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={signOut}
            className="mono border border-line px-3 py-1.5 text-[11px] tracking-[0.1em] text-fg-3 uppercase transition-colors hover:border-line-2 hover:text-fg"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">
        {loadError ? (
          <p className="border-s-2 border-acc bg-acc-soft/20 px-4 py-3 text-[13px] text-fg">{loadError}</p>
        ) : null}

        {/* ── Inbox ─────────────────────────────────────────────── */}
        {tab === "inbox" ? (
          <>
            <dl className="grid grid-cols-3 gap-px border border-line bg-line">
              <Stat label="Total" value={stats.total} />
              <Stat label="Unread" value={stats.unread} accent={stats.unread > 0} />
              <Stat
                label="Email undelivered"
                value={stats.undelivered}
                accent={stats.undelivered > 0}
                hint={stats.undelivered > 0 ? "Saved but no notification sent" : undefined}
              />
            </dl>

            {messages === null ? (
              <p className="mono mt-10 text-[12px] text-fg-3">Loading…</p>
            ) : messages.length === 0 ? (
              <div className="mt-10 border border-dashed border-line px-6 py-14 text-center">
                <p className="text-[14px] text-fg-2">No messages yet.</p>
                <p className="mt-1 text-[13px] text-fg-3">
                  Submissions from the contact form land here.
                </p>
              </div>
            ) : (
              <ul className="mt-8 border-t border-line">
                {messages.map((m) => (
                  <li
                    key={m.id}
                    className={`grid gap-3 border-b border-line py-5 sm:grid-cols-[7.5rem_1fr] ${
                      m.archived ? "opacity-55" : ""
                    }`}
                  >
                    <div className="mono flex flex-row items-baseline gap-2 text-[11px] text-fg-3 sm:flex-col sm:gap-1">
                      <span>#{m.id}</span>
                      <span>{formatDate(m.created_at)}</span>
                      {!m.notified ? (
                        <span className="text-acc" title="Saved but not emailed">
                          no email
                        </span>
                      ) : null}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="text-[14.5px] font-medium text-fg">{m.name}</span>
                        <a
                          href={`mailto:${m.email}`}
                          className="mono text-[12px] text-fg-3 underline-offset-4 hover:text-acc hover:underline"
                        >
                          {m.email}
                        </a>
                        {m.topic ? (
                          <span className="mono rounded-sm border border-line px-1.5 py-0.5 text-[10px] text-fg-3">
                            {m.topic}
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-2 max-w-[70ch] text-[13.5px] leading-relaxed whitespace-pre-wrap text-fg-2">
                        {m.message}
                      </p>

                      <div className="mt-3 flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => archive(m.id, !m.archived)}
                          className="mono text-[11px] text-fg-3 transition-colors hover:text-acc"
                        >
                          {m.archived ? "Restore" : "Archive"}
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(m.id)}
                          className="mono text-[11px] text-fg-3 transition-colors hover:text-acc"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : null}

        {/* ── Settings ──────────────────────────────────────────── */}
        {tab === "settings" ? (
          <Settings
            settings={settings}
            state={settingsState}
            onChange={(key, value) => setSettings((s) => ({ ...s, [key]: value }))}
            onSave={saveSettings}
          />
        ) : null}

        {/* ── System ────────────────────────────────────────────── */}
        {tab === "system" ? <SystemPanel /> : null}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Stat({
  label,
  value,
  accent,
  hint,
}: {
  label: string;
  value: number;
  accent?: boolean;
  hint?: string;
}) {
  return (
    <div className="bg-bg px-5 py-5">
      <dt className="mono text-[10.5px] tracking-[0.14em] text-fg-3 uppercase">{label}</dt>
      <dd className={`mt-2 font-display text-3xl leading-none font-medium ${accent ? "text-acc" : "text-fg"}`}>
        {value}
      </dd>
      {hint ? <p className="mt-2 text-[11.5px] text-fg-3">{hint}</p> : null}
    </div>
  );
}

function Settings({
  settings,
  state,
  onChange,
  onSave,
}: {
  settings: Record<string, string>;
  state: "idle" | "saving" | "saved" | "error";
  onChange: (key: string, value: string) => void;
  onSave: (patch: Record<string, unknown>) => void;
}) {
  const label = "mono mb-2 block text-[10.5px] tracking-[0.14em] text-fg-3 uppercase";
  const field =
    "w-full border border-line bg-bg-1 px-4 py-3 text-[14px] text-fg focus:border-acc focus:outline-none";

  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-2xl font-medium tracking-[-0.03em] text-fg">Site settings</h2>
      <p className="mt-2 text-[13.5px] text-fg-3">
        Changes apply to the next deployment. Edit the source of truth in{" "}
        <code className="mono">src/lib/content.ts</code> for copy changes.
      </p>

      <div className="mt-8 space-y-6">
        <fieldset>
          <legend className={label}>Site theme</legend>
          <p className="-mt-1 mb-3 text-[12.5px] text-fg-3">
            Applies to every visitor within a minute. Anyone who picked a theme themselves keeps
            theirs.
          </p>

          <div className="grid gap-2 sm:grid-cols-3">
            {THEMES.map((theme) => {
              const selected = (settings.theme ?? "nocturne") === theme.id;
              return (
                <label
                  key={theme.id}
                  className={`cursor-pointer border p-3 transition-colors ${
                    selected ? "border-acc bg-acc-soft/20" : "border-line hover:border-line-2"
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={theme.id}
                    checked={selected}
                    onChange={() => onChange("theme", theme.id)}
                    className="sr-only"
                  />
                  <span className="flex items-center gap-2">
                    <span className="flex gap-1">
                      {theme.swatch.map((colour) => (
                        <span
                          key={colour}
                          className="size-3.5 border border-line-2"
                          style={{ backgroundColor: colour }}
                        />
                      ))}
                    </span>
                    <span className="text-[13.5px] font-medium text-fg">{theme.name}</span>
                    {selected ? <span className="mono text-[10px] text-acc">LIVE</span> : null}
                  </span>
                  <span className="mt-2 block text-[12px] leading-snug text-fg-3">{theme.note}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor="s-title-en" className={label}>
            Title (English)
          </label>
          <input
            id="s-title-en"
            value={settings.site_title_en ?? ""}
            onChange={(e) => onChange("site_title_en", e.target.value)}
            className={field}
          />
        </div>

        <div>
          <label htmlFor="s-title-ar" className={label}>
            Title (Arabic)
          </label>
          <input
            id="s-title-ar"
            dir="rtl"
            value={settings.site_title_ar ?? ""}
            onChange={(e) => onChange("site_title_ar", e.target.value)}
            className={field}
          />
        </div>

        <div>
          <label htmlFor="s-desc-en" className={label}>
            Description (English)
          </label>
          <textarea
            id="s-desc-en"
            rows={2}
            value={settings.site_desc_en ?? ""}
            onChange={(e) => onChange("site_desc_en", e.target.value)}
            className={`${field} resize-y`}
          />
        </div>

        <div>
          <label htmlFor="s-desc-ar" className={label}>
            Description (Arabic)
          </label>
          <textarea
            id="s-desc-ar"
            dir="rtl"
            rows={2}
            value={settings.site_desc_ar ?? ""}
            onChange={(e) => onChange("site_desc_ar", e.target.value)}
            className={`${field} resize-y`}
          />
        </div>

        <div className="flex items-start gap-3 border border-line bg-bg-1 px-4 py-4">
          <input
            id="s-maint"
            type="checkbox"
            checked={settings.maintenance === "1"}
            onChange={(e) => onChange("maintenance", e.target.checked ? "1" : "0")}
            className="mt-1 size-4 accent-[var(--acc)]"
          />
          <div>
            <label htmlFor="s-maint" className="block text-[13.5px] text-fg">
              Maintenance mode
            </label>
            <p className="mt-1 text-[12.5px] text-fg-3">
              Shows a holding message instead of the site while you work on it.
            </p>
          </div>
        </div>

        {settings.maintenance === "1" ? (
          <div>
            <label htmlFor="s-note" className={label}>
              Holding message
            </label>
            <textarea
              id="s-note"
              rows={2}
              value={settings.maintenance_note ?? ""}
              onChange={(e) => onChange("maintenance_note", e.target.value)}
              className={`${field} resize-y`}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => onSave(settings)}
          disabled={state === "saving"}
          className="sweep mono h-10 border border-line-2 px-6 text-[11px] tracking-[0.12em] text-fg uppercase transition-colors hover:text-bg disabled:opacity-50"
        >
          <span className="relative z-10">{state === "saving" ? "Saving" : "Save changes"}</span>
        </button>
        {state === "saved" ? <span className="mono text-[11px] text-acc">Saved</span> : null}
        {state === "error" ? <span className="mono text-[11px] text-acc">Failed</span> : null}
      </div>
    </div>
  );
}

function SystemPanel() {
  const rows: [string, string][] = [
    ["Worker", "ghawi-app"],
    ["Runtime", "Cloudflare Workers (workerd)"],
    ["Framework", "Next.js 16 · React 19 · Tailwind v4"],
    ["Adapter", "@opennextjs/cloudflare"],
    ["Region", "Global edge"],
    ["Sessions", "Stateless HMAC · 8 hour TTL"],
    ["Password", "PBKDF2-SHA256 · 210,000 iterations"],
    ["Spam defence", "Turnstile + honeypot + 5/hr per IP"],
  ];

  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-2xl font-medium tracking-[-0.03em] text-fg">System</h2>

      <dl className="mt-8 border-t border-line">
        {rows.map(([key, value]) => (
          <div key={key} className="grid gap-1 border-b border-line py-3 sm:grid-cols-[10rem_1fr] sm:gap-6">
            <dt className="mono text-[11.5px] text-fg-3">{key}</dt>
            <dd className="mono text-[12.5px] text-fg-2">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10">
        <h3 className="mono text-[10.5px] tracking-[0.14em] text-fg-3 uppercase">Useful commands</h3>
        <ul className="mono mt-3 space-y-1.5 text-[12px] text-fg-2">
          <li>
            <code>pnpm deploy</code> — build and ship
          </li>
          <li>
            <code>pnpm exec wrangler d1 execute ghawi-app-contacts --remote --command &quot;SELECT …&quot;</code>
          </li>
          <li>
            <code>pnpm exec wrangler tail</code> — live Worker logs
          </li>
        </ul>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso.includes("T") ? iso : iso.replace(" ", "T") + "Z");
  if (Number.isNaN(date.getTime())) return iso.slice(0, 16);
  return date.toISOString().slice(0, 16).replace("T", " ");
}