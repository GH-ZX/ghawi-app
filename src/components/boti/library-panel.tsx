"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EXAMPLE_PAYMENT, EXAMPLE_PROVIDER } from "@/lib/boti/examples";
import { specEndpoints, validateSpec, type AdapterSpec } from "@/lib/boti/spec";
import { ago, api } from "./shared";

type Adapter = { id: string; kind: "provider" | "payment"; name: string; version: number; spec: AdapterSpec; enabled: boolean; notes: string | null; updated_at: string };

type TryResult = {
  ok: boolean;
  status?: number;
  ms?: number;
  error?: string;
  errors?: string[];
  request?: { method: string; url: string };
  mapped?: Record<string, unknown>[];
  mapped_count?: number;
  raw?: string;
};

/** Default "Try it" values for each endpoint's template vars. */
const TRY_VARS: Record<string, string> = {
  balance: "",
  products: "",
  order: "product_id=\nquantity=1\nreference=TEST-1",
  status: "order_id=",
  create: "amount=1\ncurrency=USD\nreference=TEST-1\nwebhook_url=https://example.com/webhook\nreturn_url=https://example.com",
};

function parseVars(text: string): Record<string, string> {
  return Object.fromEntries(
    text
      .split("\n")
      .map((line) => line.split("="))
      .filter(([key]) => key && key.trim())
      .map(([key, ...rest]) => [key.trim(), rest.join("=").trim()]),
  );
}

function Editor({ adapter, onSaved, onCancel }: { adapter: Adapter | null; onSaved: () => void; onCancel: () => void }) {
  const [text, setText] = useState(() => JSON.stringify(adapter?.spec ?? EXAMPLE_PROVIDER, null, 2));
  const [enabled, setEnabled] = useState(adapter?.enabled ?? false);
  const [notes, setNotes] = useState(adapter?.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [serverErrors, setServerErrors] = useState<string[]>([]);

  // Try it
  const [endpoint, setEndpoint] = useState("");
  const [token, setToken] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [vars, setVars] = useState("");
  const [trying, setTrying] = useState(false);
  const [tryResult, setTryResult] = useState<TryResult | null>(null);

  const check = useMemo(() => {
    try {
      return validateSpec(JSON.parse(text));
    } catch (error) {
      return { ok: false as const, errors: [`Not valid JSON: ${(error as Error).message}`] };
    }
  }, [text]);

  const endpoints = check.ok ? specEndpoints(check.spec).map((e) => e.name) : [];

  async function save() {
    setBusy(true);
    setServerErrors([]);
    try {
      const body = await api<{ ok: boolean; errors?: string[] }>("/api/boti/adapters", { method: "POST", body: JSON.stringify({ spec: text, enabled, notes }) });
      if (!body.ok) setServerErrors(body.errors ?? ["Not saved"]);
      else onSaved();
    } catch (err) {
      setServerErrors([(err as Error).message]);
    } finally {
      setBusy(false);
    }
  }

  async function tryIt() {
    setTrying(true);
    setTryResult(null);
    try {
      const body = await api<TryResult>("/api/boti/adapters/try", {
        method: "POST",
        body: JSON.stringify({ spec: text, endpoint, token, base_url: baseUrl, vars: parseVars(vars) }),
      });
      setTryResult(body);
    } catch (err) {
      setTryResult({ ok: false, error: (err as Error).message });
    } finally {
      setTrying(false);
    }
  }

  return (
    <div className="card card--pad boti__editor">
      <div className="theme-panel__head">
        <h3>{adapter ? `Edit ${adapter.name}` : "New spec"}</h3>
        {!adapter ? (
          <div className="seg" role="group" aria-label="Start from">
            <button type="button" className="press" onClick={() => setText(JSON.stringify(EXAMPLE_PROVIDER, null, 2))}>
              Provider example
            </button>
            <button type="button" className="press" onClick={() => setText(JSON.stringify(EXAMPLE_PAYMENT, null, 2))}>
              Payment example
            </button>
          </div>
        ) : null}
      </div>

      <label className="field">
        <span className="field__label">Spec (JSON)</span>
        <textarea className="textarea boti__json" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} aria-invalid={!check.ok} />
      </label>
      {check.ok ? (
        <p className="hint">
          Valid {check.spec.kind} spec · id <code>{check.spec.id}</code>
          {adapter ? ` · saving makes it version ${adapter.version + 1}` : ""}
        </p>
      ) : (
        <ul className="boti__errors">
          {check.errors.slice(0, 12).map((e) => (
            <li key={e} className="error-text">
              {e}
            </li>
          ))}
        </ul>
      )}

      <div className="boti__grid">
        <label className="ivp__check">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Enabled — served to client bots
        </label>
        <label className="field boti__wide">
          <span className="field__label">Notes</span>
          <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Where the API docs are, quirks…" />
        </label>
      </div>
      {serverErrors.length ? (
        <ul className="boti__errors">
          {serverErrors.map((e) => (
            <li key={e} className="error-text">
              {e}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="message__actions">
        <button type="button" className="btn btn--sm press" onClick={save} disabled={busy || !check.ok}>
          {busy ? "Saving" : "Save"}
        </button>
        <button type="button" className="btn btn--sm btn--soft press" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <fieldset className="sp__set boti__try">
        <legend>Try it</legend>
        <p className="hint">Runs one endpoint from the server. The token is used for this request only and never stored.</p>
        <div className="boti__grid">
          <label className="field">
            <span className="field__label">Endpoint</span>
            <select
              className="select"
              value={endpoint}
              onChange={(e) => {
                setEndpoint(e.target.value);
                setVars(TRY_VARS[e.target.value] ?? "");
              }}
              disabled={!endpoints.length}
            >
              <option value="">Choose…</option>
              {endpoints.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">API token</span>
            <input className="input" type="password" value={token} onChange={(e) => setToken(e.target.value)} autoComplete="off" />
          </label>
          <label className="field boti__wide">
            <span className="field__label">Base URL <span className="muted">(empty = the spec&apos;s)</span></span>
            <input className="input" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder={check.ok ? check.spec.base_url : ""} />
          </label>
          <label className="field boti__wide">
            <span className="field__label">Variables <span className="muted">(one name=value per line)</span></span>
            <textarea className="textarea boti__short" value={vars} onChange={(e) => setVars(e.target.value)} spellCheck={false} />
          </label>
        </div>
        <div className="message__actions">
          <button type="button" className="btn btn--xs press" onClick={tryIt} disabled={trying || !endpoint || !check.ok}>
            {trying ? <span className="spinner" aria-hidden="true" /> : null}
            Send request
          </button>
        </div>
        {tryResult ? (
          <div className="boti__result">
            <p className={tryResult.ok ? "hint" : "error-text"}>
              {tryResult.request ? `${tryResult.request.method} ${tryResult.request.url} → ` : ""}
              {tryResult.status ? `HTTP ${tryResult.status}` : tryResult.error}
              {tryResult.ms !== undefined ? ` · ${tryResult.ms} ms` : ""}
            </p>
            {tryResult.mapped ? (
              <>
                <span className="field__label">
                  Mapped ({tryResult.mapped_count} item{tryResult.mapped_count === 1 ? "" : "s"}, first {tryResult.mapped.length})
                </span>
                <pre className="boti__pre">{JSON.stringify(tryResult.mapped, null, 2)}</pre>
              </>
            ) : null}
            {tryResult.raw ? (
              <details>
                <summary className="field__label">Raw response</summary>
                <pre className="boti__pre">{tryResult.raw}</pre>
              </details>
            ) : null}
          </div>
        ) : null}
      </fieldset>
    </div>
  );
}

export function LibraryPanel() {
  const [adapters, setAdapters] = useState<Adapter[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Adapter | "new" | null>(null);

  // Bumped after a change; the effect below refetches when it moves.
  const [version, setVersion] = useState(0);
  const load = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const body = await api<{ adapters: Adapter[] }>("/api/boti/adapters", { signal: controller.signal });
        setAdapters(body.adapters);
        setError(null);
      } catch (err) {
        if (!controller.signal.aborted) setError((err as Error).message);
      }
    })();
    return () => controller.abort();
  }, [version]);

  async function toggle(adapter: Adapter) {
    await api("/api/boti/adapters", { method: "PATCH", body: JSON.stringify({ id: adapter.id, enabled: !adapter.enabled }) });
    void load();
  }

  async function remove(adapter: Adapter) {
    if (!window.confirm(`Delete ${adapter.name}? Client panels that already pasted it keep their copy.`)) return;
    await api(`/api/boti/adapters?id=${encodeURIComponent(adapter.id)}`, { method: "DELETE" });
    void load();
  }

  return (
    <section className="boti__panel">
      <div className="theme-panel__head">
        <div>
          <h2>API library</h2>
          <p className="muted">
            Your private catalog of provider and payment APIs. Copy a spec&apos;s JSON and paste it into a client&apos;s panel (Providers → Custom API, or Settings → Payments → Custom payment methods). Client bots never contact boti.
          </p>
        </div>
        {editing === null ? (
          <button type="button" className="btn btn--xs press" onClick={() => setEditing("new")}>
            New spec
          </button>
        ) : null}
      </div>

      {editing !== null ? (
        <Editor
          key={editing === "new" ? "new" : editing.id}
          adapter={editing === "new" ? null : editing}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void load();
          }}
        />
      ) : null}

      {error ? (
        <p className="login__alert" role="alert">
          {error}
        </p>
      ) : null}

      {adapters === null && !error ? (
        <div className="empty">
          <span className="spinner" aria-hidden="true" />
          Loading…
        </div>
      ) : adapters && !adapters.length ? (
        <div className="empty">No specs yet. Start from the provider or payment example.</div>
      ) : (
        <ul className="messages">
          {(adapters ?? []).map((adapter) => (
            <li key={adapter.id} className={adapter.enabled ? "message" : "message message--archived"}>
              <div className="message__top">
                <span className="message__who">
                  <strong>{adapter.name}</strong>
                  <code className="muted">{adapter.id}</code>
                </span>
                <span className="message__when">
                  v{adapter.version} · {ago(adapter.updated_at)}
                </span>
              </div>
              <div className="message__tags">
                <span className="badge">{adapter.kind === "provider" ? "Provider" : "Payment"}</span>
                {adapter.enabled ? <span className="badge badge--good">Enabled</span> : <span className="badge badge--soft">Off</span>}
              </div>
              {adapter.notes ? <p className="message__text">{adapter.notes}</p> : null}
              <div className="message__actions">
                <button type="button" className="btn btn--xs press" onClick={() => setEditing(adapter)}>
                  Edit / try
                </button>
                <CopyJson spec={adapter.spec} />
                <button type="button" className="btn btn--xs btn--soft press" onClick={() => toggle(adapter)}>
                  {adapter.enabled ? "Turn off" : "Enable"}
                </button>
                <button type="button" className="btn btn--xs btn--danger-soft press" onClick={() => remove(adapter)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Copies the spec as pretty JSON, ready to paste into a client's panel. */
function CopyJson({ spec }: { spec: AdapterSpec }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(spec, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt("Copy the spec JSON:", JSON.stringify(spec));
    }
  }
  return (
    <button type="button" className="btn btn--xs press" onClick={copy}>
      {copied ? "Copied" : "Copy JSON"}
    </button>
  );
}
