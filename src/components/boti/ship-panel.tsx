"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalIcon } from "@/components/icons";
import type { Client, Run } from "./clients-panel";
import { ago, api, RunBadge } from "./shared";

type ShipResult = { name: string; branch: string; result: "merged" | "up_to_date" | "conflict" | "error"; sha?: string | null; compare_url?: string; error?: string };

const RESULT_LABEL: Record<ShipResult["result"], string> = {
  merged: "Merged — sync started",
  up_to_date: "Already up to date",
  conflict: "Merge conflict",
  error: "Failed",
};

export function ShipPanel({ clients, onShipped }: { clients: Client[]; onShipped: () => void }) {
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ShipResult[] | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [runs, setRuns] = useState<Record<string, Run | null>>({});
  const timer = useRef<number | null>(null);

  const behind = clients.filter((c) => (c.behind ?? 0) > 0);
  const allPicked = clients.length > 0 && picked.size === clients.length;

  function toggle(name: string) {
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  async function ship() {
    if (!picked.size) return;
    if (!window.confirm(`Merge main into ${picked.size} client branch${picked.size === 1 ? "" : "es"} and deploy?`)) return;
    setBusy(true);
    setError(null);
    setResults(null);
    try {
      const body = await api<{ results: ShipResult[]; started_at: string }>("/api/boti/ship", {
        method: "POST",
        body: JSON.stringify({ clients: [...picked] }),
      });
      setResults(body.results);
      setStartedAt(body.started_at);
      onShipped();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // Watch the sync runs the merges started, every 5 s, until they all finish (max ~10 min).
  useEffect(() => {
    const merged = (results ?? []).filter((r) => r.result === "merged").map((r) => r.branch);
    if (!merged.length || !startedAt) return;
    let rounds = 0;
    const poll = async () => {
      rounds += 1;
      try {
        const body = await api<{ runs: Record<string, Run | null> }>(`/api/boti/runs?branches=${encodeURIComponent(merged.join(","))}`);
        setRuns(body.runs);
        const done = merged.every((branch) => {
          const run = body.runs[branch];
          return run && run.created_at >= startedAt.slice(0, 19) && run.status === "completed";
        });
        if (done || rounds > 120) return;
      } catch {
        // try again next round
      }
      timer.current = window.setTimeout(poll, 5000);
    };
    timer.current = window.setTimeout(poll, 3000);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [results, startedAt]);

  return (
    <section className="boti__panel">
      <div className="theme-panel__head">
        <div>
          <h2>Ship updates</h2>
          <p className="muted">
            Merges <code>main</code> into each chosen client branch. Each merge starts that client&apos;s sync, and their Cloudflare deploys it.
          </p>
        </div>
      </div>

      <div className="card card--pad boti__ship">
        <div className="toolbar">
          <div className="message__actions">
            <button type="button" className="btn btn--xs btn--soft press" onClick={() => setPicked(allPicked ? new Set() : new Set(clients.map((c) => c.name)))}>
              {allPicked ? "Clear" : "Select all"}
            </button>
            {behind.length ? (
              <button type="button" className="btn btn--xs btn--soft press" onClick={() => setPicked(new Set(behind.map((c) => c.name)))}>
                Select the {behind.length} behind
              </button>
            ) : null}
          </div>
          <button type="button" className="btn btn--sm press" onClick={ship} disabled={busy || !picked.size}>
            {busy ? <span className="spinner" aria-hidden="true" /> : null}
            {busy ? "Merging" : `Ship to ${picked.size || "…"}`}
          </button>
        </div>

        {clients.length ? (
          <ul className="boti__checks">
            {clients.map((client) => (
              <li key={client.name}>
                <label className="ivp__check">
                  <input type="checkbox" checked={picked.has(client.name)} onChange={() => toggle(client.name)} />
                  <span>
                    <strong>{client.name}</strong>{" "}
                    <span className="muted">
                      {client.behind === null ? "branch missing" : client.behind === 0 ? "up to date" : `${client.behind} behind`}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No clients yet.</p>
        )}
      </div>

      {error ? (
        <p className="login__alert" role="alert">
          {error}
        </p>
      ) : null}

      {results ? (
        <ul className="messages">
          {results.map((result) => {
            const run = runs[result.branch] ?? null;
            const fresh = run && startedAt && run.created_at >= startedAt.slice(0, 19) ? run : null;
            return (
              <li key={result.name} className="message">
                <div className="message__top">
                  <span className="message__who">
                    <strong>{result.name}</strong>
                  </span>
                  <span className={result.result === "merged" || result.result === "up_to_date" ? "badge badge--good" : "badge badge--warn"}>
                    {RESULT_LABEL[result.result]}
                  </span>
                </div>
                {result.result === "merged" ? (
                  <div className="message__tags">
                    {fresh ? <RunBadge run={fresh} /> : <span className="badge badge--soft">Waiting for the sync to start…</span>}
                    {fresh ? (
                      <a className="hint" href={fresh.html_url} target="_blank" rel="noopener noreferrer">
                        run log · {ago(fresh.updated_at)}
                      </a>
                    ) : null}
                  </div>
                ) : null}
                {result.result === "conflict" && result.compare_url ? (
                  <p className="message__text">
                    main and {result.branch} changed the same lines. Resolve it locally (merge main into the branch), then push.{" "}
                    <a href={result.compare_url} target="_blank" rel="noopener noreferrer">
                      Compare <ExternalIcon size={12} />
                    </a>
                  </p>
                ) : null}
                {result.error ? <p className="error-text">{result.error}</p> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
