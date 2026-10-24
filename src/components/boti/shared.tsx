"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons";

/** JSON fetch against boti's own API; a 401 sends the admin back to sign in. */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    cache: "no-store",
    ...init,
    headers: { ...(init.body ? { "Content-Type": "application/json" } : {}), ...(init.headers ?? {}) },
  });
  if (response.status === 401) {
    window.location.reload();
    throw new Error("Signed out");
  }
  const body = (await response.json().catch(() => ({}))) as T & { error?: string; errors?: string[] };
  if (!response.ok && !body.errors) {
    throw new Error(
      body.error === "github_not_configured"
        ? "GITHUB_TOKEN or BOTI_REPO is not set on this deployment."
        : body.error ?? `Request failed (${response.status})`,
    );
  }
  return body;
}

const when = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

export function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso.includes("T") ? iso : `${iso.replace(" ", "T")}Z`);
  return Number.isNaN(date.getTime()) ? iso : when.format(date);
}

/** "3 min ago" for recent times, else the date. */
export function ago(iso: string | null | undefined): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms)) return iso;
  if (ms < 60_000) return "just now";
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)} min ago`;
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)} h ago`;
  return formatWhen(iso);
}

/** A value with a copy button (the site's .copy-box). */
export function CopyValue({ value, label, mono = true }: { value: string; label?: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked: the value is selectable.
    }
  }
  return (
    <div className="boti__copy">
      {label ? <span className="field__label">{label}</span> : null}
      <div className="copy-box">
        <span style={mono ? { fontFamily: "var(--font-mono)", fontSize: 13 } : undefined}>{value}</span>
        <button type="button" className="btn btn--xs btn--soft press" onClick={copy}>
          {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

/** Sync-run status as a badge. */
export function RunBadge({ run }: { run: { status: string; conclusion: string | null } | null }) {
  if (!run) return <span className="badge badge--soft">No sync yet</span>;
  if (run.status !== "completed") {
    return (
      <span className="badge">
        <span className="spinner" aria-hidden="true" /> {run.status === "queued" ? "Queued" : "Syncing"}
      </span>
    );
  }
  if (run.conclusion === "success") return <span className="badge badge--good">Synced</span>;
  return <span className="badge badge--warn">Sync {run.conclusion ?? "failed"}</span>;
}
