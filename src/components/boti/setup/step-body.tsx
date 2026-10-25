"use client";

import type { ReactNode } from "react";
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
  actions: Partial<Record<ActionId, ActionState>>;
  run: (id: ActionId) => void;
  keys: Keys | null;
  health: Health;
};

function Field({ label, k, state, dispatch, placeholder, problem, lang, type = "text", ltr = true, hint, big }: {
  label: string;
  k: keyof SetupInputs;
  state: SetupState;
  dispatch: Props["dispatch"];
  placeholder?: string;
  problem?: string;
  lang: Lang;
  type?: string;
  ltr?: boolean;
  hint?: string;
  big?: boolean;
}) {
  const id = `qs-${k}`;
  const value = state.inputs[k];
  const invalid = Boolean(problem && value);
  return (
    <label className={`qs-field ${big ? "qs-field--big" : ""}`} htmlFor={id}>
      <span className="qs-field__label">{label}</span>
      <input
        id={id}
        className="qs-input"
        type={type}
        dir={ltr ? "ltr" : "auto"}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        aria-invalid={invalid || undefined}
        onChange={(e) => dispatch({ type: "input", key: k, value: e.target.value })}
      />
      {invalid ? <span className="qs-field__hint qs-bad">{tr(lang, PROBLEMS[problem!])}</span> : hint ? <span className="qs-field__hint">{hint}</span> : null}
    </label>
  );
}

/** The step's checklist: large tick rows, staggered in. */
function Tasks({ step, state, dispatch, lang }: Pick<Props, "step" | "state" | "dispatch" | "lang">) {
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
              {!task.required ? <span className="qs-task__tag">{tr(lang, UI.optional)}</span> : null}
            </label>
          </li>
        );
      })}
    </ul>
  );
}

/** Coder-only internals, folded away so the client's screen stays calm. */
function Details({ lang, attention, children }: { lang: Lang; attention?: boolean; children: ReactNode }) {
  return (
    <details className="qs-details" data-attention={attention || undefined}>
      <summary>
        <span>{tr(lang, UI.details)}</span>
        {attention ? <span className="qs-details__dot" aria-label={tr(lang, UI.detailsNeeded)} /> : null}
        <span className="qs-details__hint">{tr(lang, UI.detailsHint)}</span>
      </summary>
      <div className="qs-details__body">{children}</div>
    </details>
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
      <button type="button" className="qs-pill press" disabled={disabled || status === "running"} onClick={() => run(id)}>
        {status === "running" ? <span className="spinner" aria-hidden="true" /> : status === "done" ? <DrawnCheck size={16} /> : null}
        {label}
        {status === "done" ? <span className="qs-pill__again"> · {tr(lang, UI.runAgain)}</span> : null}
      </button>
      {a.message ? (
        <span className={status === "error" ? "error-text" : "qs-field__hint"} role={status === "error" ? "alert" : undefined}>
          {a.message}
        </span>
      ) : null}
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

const missingAction = (state: SetupState, step: StepId) => stepProblems(state, step).some((p) => p.startsWith("action:"));

export function StepBody(props: Props) {
  const { step, state, dispatch, lang, actions, run, keys, health } = props;
  const i = state.inputs;
  const problems = stepProblems(state, step);
  const has = (key: string) => problems.includes(key);
  const nameOk = !stepProblems(state, "welcome").length;

  switch (step) {
    case "welcome":
      return (
        <div className="qs-body">
          <Field big label={tr(lang, UI.brand)} k="brand" state={state} dispatch={dispatch} placeholder="Sara Store" lang={lang} ltr={false} />
          <div className="qs-field">
            <span className="qs-field__label">{tr(lang, UI.language)}</span>
            <div className="qs-choices" role="radiogroup" aria-label={tr(lang, UI.language)}>
              {([
                ["both", UI.langBoth, UI.langBothHint],
                ["ar", UI.langAr, null],
                ["en", UI.langEn, null],
              ] as const).map(([value, label, hint]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={i.lang === value}
                  className="qs-choice press"
                  onClick={() => dispatch({ type: "input", key: "lang", value })}
                >
                  <span className="qs-choice__radio" aria-hidden="true">{i.lang === value ? <DrawnCheck size={14} /> : null}</span>
                  <span className="qs-choice__text">
                    <strong>{tr(lang, label)}</strong>
                    {hint ? <span>{tr(lang, hint)}</span> : null}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <Details lang={lang} attention={Boolean(i.brand) && has("client")}>
            <Field label={tr(lang, UI.clientName)} k="client" state={state} dispatch={dispatch} placeholder="sara-store" problem={has("client") ? "client" : undefined} lang={lang} hint={`client/${i.client || "<name>"}`} />
          </Details>
        </div>
      );

    case "telegram":
      return (
        <div className="qs-body">
          <Tasks {...props} />
          <Field label={tr(lang, UI.botUsername)} k="bot_username" state={state} dispatch={dispatch} placeholder="SaraStoreBot" problem={has("bot_username") ? "bot_username" : undefined} lang={lang} />
          <p className="qs-note">{tr(lang, UI.tokenNote)}</p>
          <a className="qs-link" href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer">
            @BotFather <ExternalIcon size={14} />
          </a>
        </div>
      );

    case "github":
      return (
        <div className="qs-body">
          <Field label={tr(lang, UI.repo)} k="repo" state={state} dispatch={dispatch} placeholder="sara/my-store" problem={has("repo") ? "repo" : undefined} lang={lang} />
          <Tasks {...props} />
          <Details lang={lang} attention={missingAction(state, "github")}>
            <ActionButton id="deploy_key" label={tr(lang, UI.deployKey)} run={run} actions={actions} lang={lang} disabled={!nameOk} done={state.actions.deploy_key} />
            {i.public_key ? (
              <div className="qs-reveal">
                <CopyValue value={i.public_key} />
                <span className="qs-field__hint">{tr(lang, UI.deployKeyHint)}</span>
              </div>
            ) : null}
          </Details>
        </div>
      );

    case "supabase":
      return (
        <div className="qs-body">
          <Field label={tr(lang, UI.supabaseUrl)} k="supabase_url" state={state} dispatch={dispatch} placeholder="https://abcd.supabase.co" problem={has("supabase_url") ? "supabase_url" : undefined} lang={lang} hint={i.supabase_ref ? `ref · ${i.supabase_ref}` : undefined} />
          <Field label={tr(lang, UI.ownerEmail)} k="owner_email" type="email" state={state} dispatch={dispatch} placeholder="owner@example.com" problem={has("owner_email") ? "owner_email" : undefined} lang={lang} />
          <Tasks {...props} />
          <Details lang={lang}>
            <span className="qs-field__label">{tr(lang, UI.commands)}</span>
            <Commands lines={["npx supabase login", `npx supabase link --project-ref ${i.supabase_ref || "<ref>"}`, "npx supabase db push"]} />
          </Details>
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
          <Field label={tr(lang, UI.domain)} k="domain" state={state} dispatch={dispatch} placeholder="store.example.com" problem={has("domain") ? "domain" : undefined} lang={lang} />
          <Tasks {...props} />
          <div className="qs-health" aria-live="polite">
            <button type="button" className="qs-pill press" disabled={!i.domain || actions.health?.status === "running"} onClick={() => run("health")}>
              {actions.health?.status === "running" ? <span className="spinner" aria-hidden="true" /> : null}
              {tr(lang, UI.check)}
            </button>
            {health ? (
              <span className={`qs-live ${health.up ? "qs-live--up" : "qs-live--down"}`}>
                <span className="qs-live__dot" aria-hidden="true" />
                {health.up ? tr(lang, UI.siteUp) : tr(lang, UI.siteDown)}
                {health.ms != null ? ` · ${health.ms} ms` : ""}
              </span>
            ) : !i.domain ? (
              <span className="qs-field__hint">{tr(lang, UI.needsDomain)}</span>
            ) : null}
          </div>
          <Details lang={lang} attention={missingAction(state, "cloudflare")}>
            <Field label={tr(lang, UI.workerName)} k="worker_name" state={state} dispatch={dispatch} problem={has("worker_name") ? "worker_name" : undefined} lang={lang} />
            <div className="qs-actions">
              <ActionButton id="register" label={`1 · ${tr(lang, UI.register)}`} run={run} actions={actions} lang={lang} disabled={!ready} done={state.actions.register} />
              <ActionButton id="branch" label={`2 · ${tr(lang, UI.branch)}`} run={run} actions={actions} lang={lang} disabled={!ready || !state.actions.register} done={state.actions.branch} />
              <ActionButton id="sync" label={`3 · ${tr(lang, UI.sync)}`} run={run} actions={actions} lang={lang} disabled={!state.actions.branch} done={state.actions.sync} />
              {!ready ? <p className="qs-field__hint">{tr(lang, UI.needsName)}</p> : null}
            </div>
            <div className="qs-secrets">
              <div className="qs-secrets__head">
                <strong>{tr(lang, UI.secrets)}</strong>
                <ActionButton id="keys" label={tr(lang, UI.keys)} run={run} actions={actions} lang={lang} disabled={!nameOk} />
              </div>
              {keys ? <p className="qs-field__hint qs-warn">{tr(lang, UI.keysOnce)}</p> : null}
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
                            Copy name
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </Details>
        </div>
      );
    }

    case "payments":
      return (
        <div className="qs-body">
          <Tasks {...props} />
          {i.domain ? (
            <a className="qs-link" href={`https://${i.domain}/admin/`} target="_blank" rel="noopener noreferrer">
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
              <a className="qs-pill qs-pill--strong press" href={`https://${i.domain}/admin/`} target="_blank" rel="noopener noreferrer">
                {tr(lang, UI.panel)} <ExternalIcon size={14} />
              </a>
            ) : (
              <span className="qs-field__hint">{tr(lang, UI.needsDomain)}</span>
            )}
            {i.bot_username ? (
              <a className="qs-pill press" href={`https://t.me/${i.bot_username}`} target="_blank" rel="noopener noreferrer">
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
