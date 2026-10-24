"use client";

import { useState, type FormEvent } from "react";
import { ExternalIcon } from "@/components/icons";
import { ago, api, RunBadge } from "./shared";

export type Run = { id: number; status: string; conclusion: string | null; html_url: string; created_at: string; updated_at: string };

export type Client = {
  name: string;
  branch: string;
  repo: string;
  deploy_key_secret: string;
  domain: string | null;
  supabase_ref: string | null;
  telegram_bot: string | null;
  notes: string | null;
  has_library_key: boolean;
  behind: number | null;
  ahead: number | null;
  compare_url: string | null;
  last_sync: Run | null;
  site: { up: boolean | null; ms: number | null; code: number | null };
};

function SiteBadge({ site }: { site: Client["site"] }) {
  if (site.up === null) return <span className="badge badge--soft">No domain set</span>;
  if (site.up) {
    return (
      <span className="badge badge--good">
        <span className="live-dot" aria-hidden="true" /> Up{site.ms !== null ? ` · ${site.ms} ms` : ""}
      </span>
    );
  }
  return <span className="badge badge--warn">Down{site.code ? ` · HTTP ${site.code}` : ""}</span>;
}

function VersionBadge({ client }: { client: Client }) {
  if (client.behind === null) return <span className="badge badge--soft">Branch missing</span>;
  if (client.behind === 0) return <span className="badge badge--good">Up to date</span>;
  return <span className="badge badge--warn">{client.behind} update{client.behind === 1 ? "" : "s"} behind</span>;
}

function EditClient({ client, onSaved }: { client: Client; onSaved: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await api("/api/boti/clients", {
        method: "PATCH",
        body: JSON.stringify({
          name: client.name,
          domain: data.get("domain"),
          telegram_bot: data.get("telegram_bot"),
          supabase_ref: data.get("supabase_ref"),
          notes: data.get("notes"),
        }),
      });
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="boti__edit" onSubmit={save}>
      <div className="boti__grid">
        <label className="field">
          <span className="field__label">Domain</span>
          <input className="input" name="domain" defaultValue={client.domain ?? ""} placeholder="store.example.com" />
        </label>
        <label className="field">
          <span className="field__label">Telegram bot</span>
          <input className="input" name="telegram_bot" defaultValue={client.telegram_bot ?? ""} placeholder="MyStoreBot" />
        </label>
        <label className="field">
          <span className="field__label">Supabase project ref</span>
          <input className="input" name="supabase_ref" defaultValue={client.supabase_ref ?? ""} />
        </label>
        <label className="field boti__wide">
          <span className="field__label">Notes</span>
          <textarea className="textarea boti__short" name="notes" defaultValue={client.notes ?? ""} />
        </label>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      <div className="message__actions">
        <button type="submit" className="btn btn--xs press" disabled={busy}>
          {busy ? "Saving" : "Save"}
        </button>
      </div>
    </form>
  );
}

export function ClientsPanel({
  clients,
  repo,
  loading,
  error,
  reload,
}: {
  clients: Client[];
  repo: string;
  loading: boolean;
  error: string | null;
  reload: () => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const up = clients.filter((c) => c.site.up).length;
  const behind = clients.filter((c) => (c.behind ?? 0) > 0).length;
  const failed = clients.filter((c) => c.last_sync?.status === "completed" && c.last_sync.conclusion !== "success").length;

  return (
    <section className="boti__panel">
      <div className="theme-panel__head">
        <div>
          <h2>Clients</h2>
          <p className="muted">
            Every store in <code>{repo || "the repo"}</code>&apos;s clients.json, with its site, version and last sync.
          </p>
        </div>
        <button type="button" className="btn btn--xs btn--soft press" onClick={reload} disabled={loading}>
          {loading ? <span className="spinner" aria-hidden="true" /> : null}
          Refresh
        </button>
      </div>

      <dl className="kpis">
        <div className="kpi">
          <dt>Clients</dt>
          <dd className="num">{clients.length}</dd>
        </div>
        <div className="kpi">
          <dt>Sites up</dt>
          <dd className="num">{up}</dd>
        </div>
        <div className={behind ? "kpi kpi--alert" : "kpi"}>
          <dt>Behind main</dt>
          <dd className="num">{behind}</dd>
        </div>
        <div className={failed ? "kpi kpi--alert" : "kpi"}>
          <dt>Last sync failed</dt>
          <dd className="num">{failed}</dd>
        </div>
      </dl>

      {error ? (
        <p className="login__alert" role="alert">
          {error}
        </p>
      ) : null}

      {loading && !clients.length ? (
        <div className="empty">
          <span className="spinner" aria-hidden="true" />
          Reading the clients from GitHub…
        </div>
      ) : !clients.length && !error ? (
        <div className="empty">No clients yet. Add the first one under New client.</div>
      ) : (
        <ul className="messages">
          {clients.map((client) => (
            <li key={client.name} className="message">
              <div className="message__top">
                <span className="message__who">
                  <strong>{client.name}</strong>
                  <a href={`https://github.com/${client.repo}`} target="_blank" rel="noopener noreferrer">
                    {client.repo}
                  </a>
                </span>
                <span className="message__when">{client.branch}</span>
              </div>
              <div className="message__tags">
                <SiteBadge site={client.site} />
                <VersionBadge client={client} />
                <RunBadge run={client.last_sync} />
                {client.has_library_key ? <span className="badge badge--soft">Library key set</span> : null}
              </div>
              {client.last_sync ? (
                <p className="hint">
                  Last sync {ago(client.last_sync.updated_at)} ·{" "}
                  <a href={client.last_sync.html_url} target="_blank" rel="noopener noreferrer">
                    run log
                  </a>
                </p>
              ) : null}
              {client.notes ? <p className="message__text">{client.notes}</p> : null}
              <div className="message__actions">
                {client.domain ? (
                  <>
                    <a className="btn btn--xs btn--ghost press" href={`https://${client.domain}`} target="_blank" rel="noopener noreferrer">
                      Store <ExternalIcon size={14} />
                    </a>
                    <a className="btn btn--xs btn--ghost press" href={`https://${client.domain}/admin/`} target="_blank" rel="noopener noreferrer">
                      Panel <ExternalIcon size={14} />
                    </a>
                  </>
                ) : null}
                {client.telegram_bot ? (
                  <a className="btn btn--xs btn--ghost press" href={`https://t.me/${client.telegram_bot}`} target="_blank" rel="noopener noreferrer">
                    Bot <ExternalIcon size={14} />
                  </a>
                ) : null}
                {client.compare_url && (client.behind ?? 0) > 0 ? (
                  <a className="btn btn--xs btn--ghost press" href={client.compare_url} target="_blank" rel="noopener noreferrer">
                    What&apos;s new <ExternalIcon size={14} />
                  </a>
                ) : null}
                <button type="button" className="btn btn--xs btn--soft press" onClick={() => setEditing(editing === client.name ? null : client.name)}>
                  {editing === client.name ? "Close" : "Edit details"}
                </button>
              </div>
              {editing === client.name ? (
                <EditClient
                  client={client}
                  onSaved={() => {
                    setEditing(null);
                    reload();
                  }}
                />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
