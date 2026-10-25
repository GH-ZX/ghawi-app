"use client";

import { useMemo, useState } from "react";
import { PrintIcon } from "@/components/icons";
import { api, CopyValue } from "./shared";

type StepId = "deploy_key" | "register" | "branch" | "keys";
type StepState = { status: "idle" | "running" | "done" | "error"; message?: string };

type Details = {
  name: string;
  repo: string;
  domain: string;
  worker_name: string;
  supabase_ref: string;
  supabase_url: string;
  telegram_bot: string;
};

type Keys = { ENCRYPTION_KEY: string; TELEGRAM_WEBHOOK_SECRET: string };

const STEPS: { id: StepId; title: string; detail: string }[] = [
  { id: "deploy_key", title: "Deploy key", detail: "New Ed25519 key pair. The private key goes straight into the repo secret; you get the public key for the client." },
  { id: "register", title: "Register", detail: "Adds the client to .github/clients.json on main." },
  { id: "branch", title: "Client branch", detail: "Creates client/<name> from main with the Worker name and SUPABASE_URL in wrangler.jsonc." },
  { id: "keys", title: "Keys", detail: "ENCRYPTION_KEY and TELEGRAM_WEBHOOK_SECRET. Shown once." },
];

const EMPTY: Details = { name: "", repo: "", domain: "", worker_name: "plus-store-x", supabase_ref: "", supabase_url: "", telegram_bot: "" };


function Checklist({ details, publicKey, keys }: { details: Details; publicKey: string | null; keys: Keys | null }) {
  const worker = details.worker_name || "plus-store-x";
  return (
    <div className="card card--pad boti__checklist" id="boti-checklist">
      <div className="theme-panel__head">
        <div>
          <h3>Checklist for {details.name || "the client"}</h3>
          <p className="muted">Send this to the store owner. Their accounts, their keys: only they can do these steps.</p>
        </div>
        <button type="button" className="btn btn--xs btn--soft press boti__no-print" onClick={() => window.print()}>
          <PrintIcon size={14} /> Print
        </button>
      </div>

      <ol className="boti__steps-list">
        <li>
          <strong>GitHub — deploy key.</strong> In <code>{details.repo || "your-user/plus-store-x"}</code> (private, no README): Settings → Deploy keys → Add deploy key. Paste the key below and tick <em>Allow write access</em>.
          {publicKey ? <CopyValue value={publicKey} /> : <p className="hint">Run the Deploy key step to get it.</p>}
        </li>
        <li>
          <strong>Supabase.</strong> New project (save the database password). Authentication → turn off new sign-ups, add your admin user (Auto confirm). Storage → new public bucket <code>public-assets</code>.
        </li>
        <li>
          <strong>Database tables.</strong> In your GitHub repo → Settings → Secrets and variables → Actions, add <code>SUPABASE_ACCESS_TOKEN</code>, <code>SUPABASE_PROJECT_REF</code>
          {details.supabase_ref ? (
            <>
              {" "}(<code>{details.supabase_ref}</code>)
            </>
          ) : null}{" "}
          and <code>SUPABASE_DB_PASSWORD</code>. After the first sync, run Actions → Database migrations → Run workflow. Every later update applies its own migrations.
        </li>
        <li>
          <strong>Cloudflare.</strong> Workers &amp; Pages → Create → Import a repository → your repo. Project name <code>{worker}</code>, build command <code>npm run build</code>, deploy command <code>npx wrangler deploy</code>, root <code>/</code>.
        </li>
        <li>
          <strong>Cloudflare secrets</strong> (Settings → Variables and Secrets, type Secret). <code>SUPABASE_URL</code> is already in the code, so don&apos;t add it here.
          <ul>
            <li>
              <code>TELEGRAM_BOT_TOKEN</code> — from @BotFather{details.telegram_bot ? ` (@${details.telegram_bot})` : ""}
            </li>
            <li>
              <code>SUPABASE_SERVICE_ROLE_KEY</code>, <code>SUPABASE_ANON_KEY</code> — Supabase → Project Settings → API
            </li>
            <li>
              <code>OWNER_EMAILS</code> — your admin email(s), comma separated
            </li>
          </ul>
          {keys ? (
            <div className="boti__keys">
              <CopyValue label="ENCRYPTION_KEY — never change it later" value={keys.ENCRYPTION_KEY} />
              <CopyValue label="TELEGRAM_WEBHOOK_SECRET" value={keys.TELEGRAM_WEBHOOK_SECRET} />
            </div>
          ) : (
            <p className="hint">Run the Keys step to generate ENCRYPTION_KEY and TELEGRAM_WEBHOOK_SECRET.</p>
          )}
        </li>
        <li>
          <strong>Deploy again</strong> so the secrets load (Deployments → Retry).
        </li>
        <li>
          <strong>First login.</strong> Open{" "}
          <code>{details.domain ? `https://${details.domain}/admin/` : `https://${worker}.<subdomain>.workers.dev/admin/`}</code>, then System → <em>Set webhook</em> and <em>Set bot commands</em>. Send <code>/start</code> to the bot.
        </li>
      </ol>
    </div>
  );
}

export function WizardPanel({ onCreated }: { onCreated: () => void }) {
  const [details, setDetails] = useState<Details>(EMPTY);
  const [steps, setSteps] = useState<Record<StepId, StepState>>({
    deploy_key: { status: "idle" },
    register: { status: "idle" },
    branch: { status: "idle" },
    keys: { status: "idle" },
  });
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [keys, setKeys] = useState<Keys | null>(null);
  const [running, setRunning] = useState(false);
  const [sync, setSync] = useState<StepState>({ status: "idle" });

  const problems = useMemo(() => {
    const list: string[] = [];
    if (!/^[a-z0-9][a-z0-9-]{1,30}$/.test(details.name)) list.push("Name: 2–31 characters, a-z, 0-9 and -");
    if (!/^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/.test(details.repo)) list.push("Client repo: owner/name");
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(details.supabase_url)) list.push("Supabase URL: https://<ref>.supabase.co");
    if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(details.worker_name)) list.push("Worker name: a-z, 0-9 and -");
    return list;
  }, [details]);

  const set = (key: keyof Details) => (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    if (key === "name") value = value.toLowerCase();
    if (key === "supabase_url") {
      const ref = /^https:\/\/([a-z0-9-]+)\.supabase\.co/.exec(value)?.[1];
      setDetails((d) => ({ ...d, supabase_url: value, supabase_ref: d.supabase_ref || ref || "" }));
      return;
    }
    setDetails((d) => ({ ...d, [key]: value }));
  };

  async function runStep(id: StepId): Promise<boolean> {
    if (id === "keys" && keys && !window.confirm("New keys replace the ones shown. Continue?")) return false;
    setSteps((s) => ({ ...s, [id]: { status: "running" } }));
    try {
      const body = await api<Record<string, unknown> & { ok?: boolean; error?: string }>("/api/boti/wizard", {
        method: "POST",
        body: JSON.stringify({ step: id, ...details }),
      });
      if (!body.ok) throw new Error(body.error ?? "Failed");
      let message = "Done";
      if (id === "deploy_key") {
        setPublicKey(String(body.public_key));
        message = `Saved as ${String(body.secret)}`;
      }
      if (id === "register") message = body.already ? "Already in clients.json" : "Committed to main";
      if (id === "branch") message = body.created ? `Created ${String(body.branch)}` : `${String(body.branch)} updated`;
      if (id === "keys") {
        setKeys({ ENCRYPTION_KEY: String(body.ENCRYPTION_KEY), TELEGRAM_WEBHOOK_SECRET: String(body.TELEGRAM_WEBHOOK_SECRET) });
        message = "Generated — copy them now, they aren't shown again";
      }
      setSteps((s) => ({ ...s, [id]: { status: "done", message } }));
      return true;
    } catch (err) {
      setSteps((s) => ({ ...s, [id]: { status: "error", message: (err as Error).message } }));
      return false;
    }
  }

  async function runAll() {
    setRunning(true);
    for (const step of STEPS) {
      if (steps[step.id].status === "done") continue;
      if (!(await runStep(step.id))) break;
    }
    setRunning(false);
    onCreated();
  }

  async function firstSync() {
    setSync({ status: "running" });
    try {
      await api("/api/boti/wizard", { method: "POST", body: JSON.stringify({ step: "sync", name: details.name }) });
      setSync({ status: "done", message: "Sync started — watch it on the Clients tab." });
    } catch (err) {
      setSync({ status: "error", message: (err as Error).message });
    }
  }

  const allDone = STEPS.every((s) => steps[s.id].status === "done");

  return (
    <section className="boti__panel">
      <div className="theme-panel__head">
        <div>
          <h2>New client</h2>
          <p className="muted">Sets up a new store in a few minutes: deploy key, clients.json, branch and keys, then a checklist for the owner.</p>
        </div>
      </div>

      <div className="card card--pad">
        <div className="boti__grid">
          <label className="field">
            <span className="field__label">Client name</span>
            <input className="input" value={details.name} onChange={set("name")} placeholder="owner2" autoComplete="off" />
            <span className="hint">Branch client/{details.name || "<name>"}, secret DEPLOY_KEY_{(details.name || "NAME").toUpperCase().replace(/-/g, "_")}</span>
          </label>
          <label className="field">
            <span className="field__label">Client GitHub repo</span>
            <input className="input" value={details.repo} onChange={set("repo")} placeholder="their-user/plus-store-x" autoComplete="off" />
          </label>
          <label className="field">
            <span className="field__label">Supabase project URL</span>
            <input className="input" value={details.supabase_url} onChange={set("supabase_url")} placeholder="https://abcd.supabase.co" autoComplete="off" />
          </label>
          <label className="field">
            <span className="field__label">Supabase project ref</span>
            <input className="input" value={details.supabase_ref} onChange={set("supabase_ref")} autoComplete="off" />
          </label>
          <label className="field">
            <span className="field__label">Worker name</span>
            <input className="input" value={details.worker_name} onChange={set("worker_name")} autoComplete="off" />
          </label>
          <label className="field">
            <span className="field__label">Domain <span className="muted">(optional)</span></span>
            <input className="input" value={details.domain} onChange={set("domain")} placeholder="store.example.com" autoComplete="off" />
          </label>
          <label className="field">
            <span className="field__label">Telegram bot <span className="muted">(optional)</span></span>
            <input className="input" value={details.telegram_bot} onChange={set("telegram_bot")} placeholder="MyStoreBot" autoComplete="off" />
          </label>
        </div>
        {problems.length && details.name ? <p className="hint">{problems.join(" · ")}</p> : null}
      </div>

      <ol className="boti__wizard">
        {STEPS.map((step, index) => {
          const state = steps[step.id];
          return (
            <li key={step.id} className="message" data-status={state.status}>
              <div className="message__top">
                <span className="message__who">
                  <strong>
                    {index + 1}. {step.title}
                  </strong>
                </span>
                <span className={state.status === "done" ? "badge badge--good" : state.status === "error" ? "badge badge--warn" : "badge badge--soft"}>
                  {state.status === "running" ? <span className="spinner" aria-hidden="true" /> : null}
                  {state.status === "idle" ? "Not run" : state.status === "running" ? "Running" : state.status === "done" ? "Done" : "Failed"}
                </span>
              </div>
              <p className="hint">{step.detail}</p>
              {state.message ? <p className={state.status === "error" ? "error-text" : "message__text"}>{state.message}</p> : null}
              <div className="message__actions">
                <button type="button" className="btn btn--xs btn--soft press" disabled={running || problems.length > 0 || state.status === "running"} onClick={() => void runStep(step.id)}>
                  {state.status === "idle" ? "Run" : "Run again"}
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="toolbar">
        <button type="button" className="btn press" onClick={runAll} disabled={running || problems.length > 0 || allDone}>
          {running ? <span className="spinner" aria-hidden="true" /> : null}
          {running ? "Setting up" : allDone ? "All steps done" : "Run all steps"}
        </button>
      </div>

      {publicKey || keys ? <Checklist details={details} publicKey={publicKey} keys={keys} /> : null}

      {allDone ? (
        <div className="card card--pad boti__no-print">
          <h3>First sync</h3>
          <p className="muted">When the owner has added the deploy key to their repo, mirror the branch to it. Their Cloudflare deploys from there.</p>
          <div className="message__actions" style={{ marginTop: 10 }}>
            <button type="button" className="btn btn--sm press" onClick={firstSync} disabled={sync.status === "running"}>
              {sync.status === "running" ? <span className="spinner" aria-hidden="true" /> : null}
              Run first sync
            </button>
          </div>
          {sync.message ? <p className={sync.status === "error" ? "error-text" : "hint"}>{sync.message}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
