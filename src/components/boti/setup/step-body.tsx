"use client";

import { ExternalIcon } from "@/components/icons";
import { type Lang, type SetupAction, type SetupInputs, type SetupState, type StepId, TASKS, stepProblems } from "@/lib/boti/setup";
import { PROBLEMS, TASK_TEXT, tr, UI } from "@/lib/boti/setup-content";
import { CopyValue } from "../shared";
import { DrawnCheck } from "./visuals";

export type ActionId = "deploy_key" | "register" | "branch" | "keys" | "sync" | "health";
export type ActionState = { status: "idle" | "running" | "done" | "error"; message?: string };
export type Keys = { ENCRYPTION_KEY: string; TELEGRAM_WEBHOOK_SECRET: string };
export type Health = { up: boolean; ms: number | null; code: number | null; at: number } | null;

type Props = {
  step: StepId;
  state: SetupState;
  dispatch: (action: SetupAction) => void;
  lang: Lang;
  clientView: boolean;
  actions: Partial<Record<ActionId, ActionState>>;
  run: (id: ActionId) => void;
  keys: Keys | null;
  health: Health;
};

function Field({ label, k, state, dispatch, placeholder, problem, lang, type = "text", dirLtr = true, hint }: {
  label: string;
  k: keyof SetupInputs;
  state: SetupState;
  dispatch: Props["dispatch"];
  placeholder?: string;
  problem?: string;
  lang: Lang;
  type?: string;
  dirLtr?: boolean;
  hint?: string;
}) {
  const id = `qs-${k}`;
  const value = state.inputs[k];
  const invalid = Boolean(problem && value);
  return (
    <label className="field" htmlFor={id}>
      <span className="field__label">{label}</span>
      <input
        id={id}
        className="input"
        type={type}
        dir={dirLtr ? "ltr" : undefined}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        aria-invalid={invalid || undefined}
        onChange={(e) => dispatch({ type: "input", key: k, value: e.target.value })}
      />
      {invalid ? <span className="hint qs-bad">{tr(lang, PROBLEMS[problem!])}</span> : hint ? <span className="hint">{hint}</span> : null}
    </label>
  );
}

/** The step's checklist: big tick boxes, staggered in. */
function Tasks({ step, state, dispatch, lang, clientView }: Pick<Props, "step" | "state" | "dispatch" | "lang" | "clientView">) {
  const tasks = TASKS[step];
  if (!tasks.length) return null;
  return (
    <ul className="qs-tasks">
      {tasks.map((task, i) => {
        const on = Boolean(state.tasks[task.id]);
        return (
          <li key={task.id} style={{ ["--i" as string]: i }}>
            <label className="qs-task" data-on={on || undefined}>
              <input type="checkbox" checked={on} onChange={(e) => dispatch({ type: "task", id: task.id, value: e.target.checked })} />
              <span className="qs-task__box" aria-hidden="true">{on ? <DrawnCheck size={16} /> : null}</span>
              <span className="qs-task__text">{tr(lang, TASK_TEXT[task.id])}</span>
              {!clientView ? <span className="qs-task__tag">{task.required ? tr(lang, UI.required) : tr(lang, UI.optional)}</span> : null}
            </label>
          </li>
        );
      })}
    </ul>
  );
}

function ActionButton({ id, label, run, actions, lang, disabled, done }: {
  id: ActionId;
  label: string;
  run: Props["run"];
  actions: Props["actions"];
  lang: Lang;
  disabled?: boolean;
  done?: boolean;
}) {
  const a = actions[id] ?? { status: done ? "done" : "idle" };
  const status = a.status === "idle" && done ? "done" : a.status;
  return (
    <div className="qs-action" data-status={status}>
      <button type="button" className={`btn btn--sm press ${status === "done" ? "btn--soft" : ""}`} disabled={disabled || status === "running"} onClick={() => run(id)}>
        {status === "running" ? <span className="spinner" aria-hidden="true" /> : status === "done" ? <DrawnCheck size={16} /> : null}
        {label}
        {status === "done" ? ` · ${tr(lang, UI.runAgain)}` : ""}
      </button>
      {a.message ? <span className={status === "error" ? "error-text" : "hint"} role={status === "error" ? "alert" : undefined}>{a.message}</span> : null}
    </div>
  );
}

function Commands({ lines }: { lines: string[] }) {
  return (
    <div className="qs-commands" dir="ltr">
      {lines.map((line) => (
        <CopyValue key={line} value={line} />
      ))}
    </div>
  );
}

export function StepBody(props: Props) {
  const { step, state, dispatch, lang, clientView, actions, run, keys, health } = props;
  const i = state.inputs;
  const problems = stepProblems(state, step);
  const has = (key: string) => problems.includes(key);
  const nameOk = !stepProblems(state, "welcome").length;

  switch (step) {
    case "welcome":
      return (
        <div className="qs-body">
          {!clientView ? (
            <div className="boti__grid">
              <Field label={tr(lang, UI.clientName)} k="client" state={state} dispatch={dispatch} placeholder="sara-store" problem={has("client") ? "client" : undefined} lang={lang} hint={`client/${i.client || "<name>"}`} />
              <Field label={tr(lang, UI.brand)} k="brand" state={state} dispatch={dispatch} placeholder="Sara Store" lang={lang} dirLtr={false} />
            </div>
          ) : null}
          <div className="field">
            <span className="field__label">{tr(lang, UI.language)}</span>
            <div className="seg" role="group" aria-label={tr(lang, UI.language)}>
              {(["ar", "en"] as const).map((l) => (
                <button key={l} type="button" className="press" aria-pressed={i.lang === l} onClick={() => dispatch({ type: "input", key: "lang", value: l })}>
                  {l === "ar" ? "العربية" : "English"}
                </button>
              ))}
            </div>
          </div>
          {clientView && i.brand ? <p className="qs-big-brand">{i.brand}</p> : null}
        </div>
      );

    case "telegram":
      return (
        <div className="qs-body">
          <Tasks {...props} />
          <Field label={tr(lang, UI.botUsername)} k="bot_username" state={state} dispatch={dispatch} placeholder="SaraStoreBot" problem={has("bot_username") ? "bot_username" : undefined} lang={lang} />
          <p className="qs-note">{tr(lang, UI.tokenNote)}</p>
          <a className="btn btn--xs btn--ghost press qs-inline-link" href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer">
            @BotFather <ExternalIcon size={14} />
          </a>
        </div>
      );

    case "github":
      return (
        <div className="qs-body">
          <Field label={tr(lang, UI.repo)} k="repo" state={state} dispatch={dispatch} placeholder="sara/my-store" problem={has("repo") ? "repo" : undefined} lang={lang} />
          {!clientView ? (
            <>
              <ActionButton id="deploy_key" label={tr(lang, UI.deployKey)} run={run} actions={actions} lang={lang} disabled={!nameOk} done={state.actions.deploy_key} />
              {i.public_key ? (
                <div className="qs-reveal">
                  <CopyValue value={i.public_key} />
                  <span className="hint">{tr(lang, UI.deployKeyHint)}</span>
                </div>
              ) : null}
            </>
          ) : null}
          <Tasks {...props} />
        </div>
      );

    case "supabase":
      return (
        <div className="qs-body">
          <div className="boti__grid">
            <Field label={tr(lang, UI.supabaseUrl)} k="supabase_url" state={state} dispatch={dispatch} placeholder="https://abcd.supabase.co" problem={has("supabase_url") ? "supabase_url" : undefined} lang={lang} hint={i.supabase_ref ? `ref: ${i.supabase_ref}` : undefined} />
            <Field label={tr(lang, UI.ownerEmail)} k="owner_email" type="email" state={state} dispatch={dispatch} placeholder="owner@example.com" problem={has("owner_email") ? "owner_email" : undefined} lang={lang} />
          </div>
          {!clientView ? (
            <div className="field">
              <span className="field__label">{tr(lang, UI.commands)}</span>
              <Commands lines={["npx supabase login", `npx supabase link --project-ref ${i.supabase_ref || "<ref>"}`, "npx supabase db push"]} />
            </div>
          ) : null}
          <Tasks {...props} />
        </div>
      );

    case "cloudflare": {
      const ready = nameOk && /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(i.supabase_url);
      const secrets: { name: string; value: string | null; note: string }[] = [
        { name: "TELEGRAM_BOT_TOKEN", value: null, note: "@BotFather" },
        { name: "SUPABASE_SERVICE_ROLE_KEY", value: null, note: "Supabase › Project Settings › API" },
        { name: "SUPABASE_ANON_KEY", value: null, note: "Supabase › Project Settings › API" },
        { name: "ENCRYPTION_KEY", value: keys?.ENCRYPTION_KEY ?? null, note: tr(lang, UI.keys) },
        { name: "TELEGRAM_WEBHOOK_SECRET", value: keys?.TELEGRAM_WEBHOOK_SECRET ?? null, note: tr(lang, UI.keys) },
        { name: "OWNER_EMAILS", value: i.owner_email || null, note: tr(lang, UI.ownerEmail) },
      ];
      return (
        <div className="qs-body">
          <div className="boti__grid">
            <Field label={tr(lang, UI.workerName)} k="worker_name" state={state} dispatch={dispatch} problem={has("worker_name") ? "worker_name" : undefined} lang={lang} />
            <Field label={tr(lang, UI.domain)} k="domain" state={state} dispatch={dispatch} placeholder="store.example.com" problem={has("domain") ? "domain" : undefined} lang={lang} />
          </div>
          {!clientView ? (
            <div className="qs-actions">
              <ActionButton id="register" label={`1 · ${tr(lang, UI.register)}`} run={run} actions={actions} lang={lang} disabled={!ready} done={state.actions.register} />
              <ActionButton id="branch" label={`2 · ${tr(lang, UI.branch)}`} run={run} actions={actions} lang={lang} disabled={!ready || !state.actions.register} done={state.actions.branch} />
              <ActionButton id="sync" label={`3 · ${tr(lang, UI.sync)}`} run={run} actions={actions} lang={lang} disabled={!state.actions.branch} done={state.actions.sync} />
              {!ready ? <p className="hint">{tr(lang, UI.needsName)}</p> : null}
            </div>
          ) : null}
          {!clientView ? (
            <div className="qs-secrets">
              <div className="qs-secrets__head">
                <strong>{tr(lang, UI.secrets)}</strong>
                <ActionButton id="keys" label={tr(lang, UI.keys)} run={run} actions={actions} lang={lang} disabled={!nameOk} />
              </div>
              {keys ? <p className="hint qs-warn">{tr(lang, UI.keysOnce)}</p> : null}
              <ul className="qs-secret-list" dir="ltr">
                {secrets.map((s, n) => (
                  <li key={s.name} style={{ ["--i" as string]: n }}>
                    {s.value ? (
                      <CopyValue label={s.name} value={s.value} />
                    ) : (
                      <div className="boti__copy">
                        <span className="field__label">{s.name}</span>
                        <div className="copy-box qs-placeholder">
                          <span>
                            {tr(lang, UI.fromClient)} · {s.note}
                          </span>
                          <button type="button" className="btn btn--xs btn--soft press" onClick={() => void navigator.clipboard?.writeText(s.name)}>
                            {s.name.length > 18 ? "Copy name" : "Copy"}
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <Tasks {...props} />
          <div className="qs-health" aria-live="polite">
            <button type="button" className="btn btn--sm btn--soft press" disabled={!i.domain || actions.health?.status === "running"} onClick={() => run("health")}>
              {actions.health?.status === "running" ? <span className="spinner" aria-hidden="true" /> : null}
              {tr(lang, UI.check)}
            </button>
            {!i.domain ? <span className="hint">{tr(lang, UI.needsDomain)}</span> : null}
            {health ? (
              <span className={`qs-live ${health.up ? "qs-live--up" : "qs-live--down"}`}>
                <span className="qs-live__dot" aria-hidden="true" />
                {health.up ? tr(lang, UI.siteUp) : tr(lang, UI.siteDown)}
                {health.ms != null ? ` · ${health.ms} ms` : ""}
              </span>
            ) : null}
          </div>
        </div>
      );
    }

    case "payments":
      return (
        <div className="qs-body">
          <Tasks {...props} />
          {i.domain ? (
            <a className="btn btn--xs btn--ghost press qs-inline-link" href={`https://${i.domain}/admin/`} target="_blank" rel="noopener noreferrer">
              {tr(lang, UI.panel)} <ExternalIcon size={14} />
            </a>
          ) : null}
        </div>
      );

    case "live":
      return (
        <div className="qs-body">
          <div className="qs-links">
            {i.domain ? (
              <a className="btn btn--sm press" href={`https://${i.domain}/admin/`} target="_blank" rel="noopener noreferrer">
                {tr(lang, UI.panel)} <ExternalIcon size={14} />
              </a>
            ) : (
              <span className="hint">{tr(lang, UI.needsDomain)}</span>
            )}
            {i.bot_username ? (
              <a className="btn btn--sm btn--soft press" href={`https://t.me/${i.bot_username}`} target="_blank" rel="noopener noreferrer">
                @{i.bot_username} <ExternalIcon size={14} />
              </a>
            ) : null}
          </div>
          <Tasks {...props} />
        </div>
      );

    case "done":
      return null;
  }
}
