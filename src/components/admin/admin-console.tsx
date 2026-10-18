"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalIcon, MoonIcon, SunIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { InvitePanel } from "./invite-panel";
import { ThemePanel } from "./theme-panel";
import { getEffectiveMode, setMode } from "@/lib/theme-client";

type Message = {
  id: number;
  created_at: string;
  name: string;
  email: string;
  topic: string | null;
  message: string;
  locale: string | null;
  notified: number;
  archived: number;
};

type Stats = { total: number; unread: number; undelivered: number };
type View = "inbox" | "archived" | "all";

const TOPICS: Record<string, string> = {
  product: "Product engineering",
  telegram: "Telegram commerce",
  infrastructure: "Infrastructure & DevOps",
  it: "IT support",
  other: "Something else",
};

const VIEWS: { id: View; label: string }[] = [
  { id: "inbox", label: "Inbox" },
  { id: "archived", label: "Archived" },
  { id: "all", label: "All" },
];

/** D1 stores UTC ISO strings; show them in the reader's own time. */
const when = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });
function formatWhen(iso: string): string {
  const date = new Date(iso.includes("T") ? iso : `${iso.replace(" ", "T")}Z`);
  return Number.isNaN(date.getTime()) ? iso : when.format(date);
}

export function AdminConsole() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [stats, setStats] = useState<Stats>({ total: 0, unread: 0, undelivered: 0 });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [view, setView] = useState<View>("inbox");
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<"inbox" | "theme" | "invite">("inbox");

  // Bumped after every change; the effect below refetches when it moves.
  const [version, setVersion] = useState(0);
  const reload = () => setVersion((v) => v + 1);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        // Archived included: the views filter locally, so switching is instant.
        const response = await fetch("/api/admin/messages?archived=1", { signal: controller.signal, cache: "no-store" });
        if (response.status === 401) {
          router.refresh();
          return;
        }
        if (!response.ok) throw new Error(String(response.status));
        const body = (await response.json()) as { messages?: Message[]; stats?: Stats };
        setMessages(body.messages ?? []);
        setStats(body.stats ?? { total: 0, unread: 0, undelivered: 0 });
        setLoadError(null);
      } catch {
        if (controller.signal.aborted) return;
        setLoadError("Could not load messages. Refresh to try again.");
      }
    })();
    return () => controller.abort();
  }, [router, version]);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (messages ?? []).filter((m) => {
      if (view === "inbox" && m.archived) return false;
      if (view === "archived" && !m.archived) return false;
      if (!needle) return true;
      return [m.name, m.email, m.message, m.topic ?? ""].some((field) => field.toLowerCase().includes(needle));
    });
  }, [messages, view, query]);

  async function archive(message: Message) {
    const archived = !message.archived;
    setMessages((list) => list?.map((m) => (m.id === message.id ? { ...m, archived: archived ? 1 : 0 } : m)) ?? null);
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: message.id, archived }),
    });
    reload();
  }

  async function remove(message: Message) {
    if (!window.confirm(`Delete the message from ${message.name} for good?`)) return;
    setMessages((list) => list?.filter((m) => m.id !== message.id) ?? null);
    await fetch(`/api/admin/messages?id=${message.id}`, { method: "DELETE" });
    reload();
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  const archivedCount = stats.total - stats.unread;

  return (
    <div className="admin">
      <header className="admin__bar">
        <div className="admin__bar-inner">
          <Link className="admin__brand" href="/admin">
            <Logo height={20} />
            ghawi.app <span>/ inbox</span>
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
            <a className="btn btn--xs btn--ghost press" href="/en" target="_blank" rel="noopener noreferrer">
              Site <ExternalIcon size={14} />
            </a>
            <button type="button" className="btn btn--xs btn--soft press" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="admin__main">
        <div className="seg admin__tabs" role="group" aria-label="Section">
          <button type="button" className="press" aria-pressed={section === "inbox"} onClick={() => setSection("inbox")}>
            Inbox{stats.unread ? ` · ${stats.unread}` : ""}
          </button>
          <button type="button" className="press" aria-pressed={section === "theme"} onClick={() => setSection("theme")}>
            Theme
          </button>
          <button type="button" className="press" aria-pressed={section === "invite"} onClick={() => setSection("invite")}>
            Invitation
          </button>
        </div>

        {section === "theme" ? (
          <ThemePanel />
        ) : section === "invite" ? (
          <InvitePanel />
        ) : (
          <>
        <dl className="kpis">
          <div className="kpi">
            <dt>Inbox</dt>
            <dd className="num">{stats.unread}</dd>
          </div>
          <div className="kpi">
            <dt>Archived</dt>
            <dd className="num">{archivedCount}</dd>
          </div>
          <div className="kpi">
            <dt>All time</dt>
            <dd className="num">{stats.total}</dd>
          </div>
          <div className={stats.undelivered > 0 ? "kpi kpi--alert" : "kpi"} title="Saved, but the notification email failed">
            <dt>Email undelivered</dt>
            <dd className="num">{stats.undelivered}</dd>
          </div>
        </dl>

        <div className="toolbar">
          <div className="seg" role="group" aria-label="Show">
            {VIEWS.map((item) => (
              <button key={item.id} type="button" className="press" aria-pressed={view === item.id} onClick={() => setView(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
          <label className="search">
            <span className="sr-only">Search messages</span>
            <input type="search" placeholder="Search name, email or text" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
        </div>

        {loadError ? (
          <p className="login__alert" role="alert">
            {loadError}
          </p>
        ) : null}

        {messages === null && !loadError ? (
          <div className="empty">
            <span className="spinner" aria-hidden="true" />
            Loading messages…
          </div>
        ) : shown.length === 0 && messages !== null ? (
          <div className="empty">
            {query
              ? "Nothing matches that search."
              : messages.length === 0
                ? "No messages yet. Submissions from the contact form land here."
                : view === "archived"
                  ? "Nothing archived."
                  : "Inbox zero. Everything else is under Archived."}
          </div>
        ) : (
          <ul className="messages">
            {shown.map((m) => (
              <li key={m.id} className={m.archived ? "message message--archived" : "message"}>
                <div className="message__top">
                  <span className="message__who">
                    <strong>{m.name}</strong>
                    <a href={`mailto:${m.email}`}>{m.email}</a>
                  </span>
                  <span className="message__when">
                    #{m.id} · {formatWhen(m.created_at)}
                  </span>
                </div>
                <div className="message__tags">
                  {m.topic ? <span className="badge">{TOPICS[m.topic] ?? m.topic}</span> : null}
                  {m.locale ? <span className="badge badge--soft">{m.locale === "ar" ? "Arabic page" : "English page"}</span> : null}
                  {!m.notified ? <span className="badge badge--warn">Email not sent</span> : null}
                </div>
                <p className="message__text">{m.message}</p>
                <div className="message__actions">
                  <a
                    className="btn btn--xs press"
                    href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message on ghawi.app")}`}
                  >
                    Reply
                  </a>
                  <button type="button" className="btn btn--xs btn--soft press" onClick={() => archive(m)}>
                    {m.archived ? "Move to inbox" : "Archive"}
                  </button>
                  <button type="button" className="btn btn--xs btn--danger-soft press" onClick={() => remove(m)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <details className="facts">
          <summary>How this works</summary>
          <dl>
            <div>
              <dt>Storage</dt>
              <dd>D1 · ghawi-app-contacts (source of truth)</dd>
            </div>
            <div>
              <dt>Notifications</dt>
              <dd>Cloudflare Email · failures flagged above</dd>
            </div>
            <div>
              <dt>Spam defence</dt>
              <dd>Turnstile · honeypot · 5 per hour per IP</dd>
            </div>
            <div>
              <dt>Sessions</dt>
              <dd>Signed cookie · 8 hours</dd>
            </div>
            <div>
              <dt>Password</dt>
              <dd>PBKDF2-SHA256 · 100,000 iterations</dd>
            </div>
          </dl>
        </details>
          </>
        )}
      </main>
    </div>
  );
}
