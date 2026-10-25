"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { BotIcon, CardIcon, ChipIcon, CloudIcon, ExternalIcon, PrintIcon, RepoIcon, SendIcon, SparkIcon } from "@/components/icons";
import {
  CLIENT_SLUG,
  type Lang,
  newSetup,
  OPTIONAL_STEPS,
  progress,
  type SetupAction,
  type SetupState,
  setupReducer,
  STEP_IDS,
  type StepId,
  stepProblems,
} from "@/lib/boti/setup";
import { PROBLEMS, STEP_TEXT, tr, UI } from "@/lib/boti/setup-content";
import { ago, api } from "../shared";
import { HowToDrawer } from "./howto-drawer";
import { type ActionId, type ActionState, type Health, type Keys, StepBody } from "./step-body";
import { Confetti, DrawnCheck, ProgressRing } from "./visuals";

type SetupSummary = { name: string; brand: string | null; progress: number; finished: number; updated_at: string };

const ICONS: Record<StepId, (p: { size?: number }) => React.ReactNode> = {
  welcome: SparkIcon,
  telegram: BotIcon,
  github: RepoIcon,
  supabase: ChipIcon,
  cloudflare: CloudIcon,
  payments: CardIcon,
  live: SendIcon,
  done: SparkIcon,
};

const WORK = STEP_IDS.filter((id) => id !== "done");
const LANG_KEY = "boti.setup.lang";

function readLang(): Lang {
  try {
    return window.localStorage.getItem(LANG_KEY) === "en" ? "en" : "ar";
  } catch {
    return "ar";
  }
}

/** Guided onboarding of a new client store: one calm step at a time, with a "client view" for showing it live. */
export function QuickSetup({ onChanged }: { onChanged: () => void }) {
  // Rendered only after the console loads on the client, so localStorage is safe to read here.
  const [lang, setLangState] = useState<Lang>(() => (typeof window === "undefined" ? "ar" : readLang()));
  const [list, setList] = useState<SetupSummary[] | null>(null);
  const [state, rawDispatch] = useReducer(setupReducer, undefined, () => newSetup());
  const [open, setOpen] = useState(false);
  const [clientView, setClientView] = useState(false);
  const [howto, setHowto] = useState(false);
  const [actions, setActions] = useState<Partial<Record<ActionId, ActionState>>>({});
  const [keys, setKeys] = useState<Keys | null>(null);
  const [health, setHealth] = useState<Health>(null);
  const [save, setSave] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const dirty = useRef(false);
  const [listVersion, setListVersion] = useState(0);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(LANG_KEY, next);
    } catch {
      // Private mode: the toggle still works for this visit.
    }
  };

  const dispatch = useCallback((action: SetupAction) => {
    if (action.type !== "load") dirty.current = true;
    rawDispatch(action);
  }, []);

  // Setups in progress.
  useEffect(() => {
    const controller = new AbortController();
    void api<{ setups: SetupSummary[] }>("/api/boti/setup", { signal: controller.signal })
      .then((body) => setList(body.setups ?? []))
      .catch(() => {
        if (!controller.signal.aborted) setList([]);
      });
    return () => controller.abort();
  }, [listVersion]);

  // Save (debounced) after every change, once the client has a valid name.
  useEffect(() => {
    if (!open || !dirty.current || !CLIENT_SLUG.test(state.inputs.client)) return;
    const timer = window.setTimeout(async () => {
      dirty.current = false;
      setSave("saving");
      try {
        await api("/api/boti/setup", { method: "PUT", body: JSON.stringify({ state }) });
        setSave("saved");
      } catch {
        dirty.current = true;
        setSave("error");
      }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [state, open]);

  function start() {
    rawDispatch({ type: "load", state: newSetup(lang) });
    dirty.current = false;
    setKeys(null);
    setHealth(null);
    setActions({});
    setOpen(true);
  }

  async function resume(name: string) {
    const body = await api<{ setup: { state: SetupState | null } | null }>(`/api/boti/setup?name=${encodeURIComponent(name)}`);
    if (!body.setup?.state) return;
    rawDispatch({ type: "load", state: body.setup.state });
    dirty.current = false;
    setKeys(null);
    setHealth(null);
    setActions({});
    setOpen(true);
  }

  async function remove(name: string) {
    if (!window.confirm(tr(lang, UI.removeConfirm))) return;
    await api(`/api/boti/setup?name=${encodeURIComponent(name)}`, { method: "DELETE" }).catch(() => null);
    setListVersion((v) => v + 1);
  }

  function close() {
    setOpen(false);
    setClientView(false);
    setListVersion((v) => v + 1);
  }

  const run = useCallback(
    async (id: ActionId) => {
      const i = state.inputs;
      if (id === "keys" && keys && !window.confirm(tr(lang, UI.keysOnce))) return;
      setActions((a) => ({ ...a, [id]: { status: "running" } }));
      try {
        if (id === "health") {
          const body = await api<{ up: boolean; ms: number | null; code: number | null }>("/api/boti/setup", {
            method: "POST",
            body: JSON.stringify({ action: "health", domain: i.domain }),
          });
          setHealth({ ...body, at: Date.now() });
          if (body.up) dispatch({ type: "action", id: "health", value: true });
          setActions((a) => ({ ...a, [id]: { status: body.up ? "done" : "idle" } }));
          return;
        }
        const body = await api<Record<string, unknown> & { ok?: boolean; error?: string }>("/api/boti/wizard", {
          method: "POST",
          body: JSON.stringify({
            step: id,
            name: i.client,
            repo: i.repo,
            domain: i.domain,
            worker_name: i.worker_name || i.client,
            supabase_ref: i.supabase_ref,
            supabase_url: i.supabase_url,
            telegram_bot: i.bot_username,
          }),
        });
        if (!body.ok) throw new Error(body.error ?? "Failed");
        if (id === "deploy_key") dispatch({ type: "input", key: "public_key", value: String(body.public_key ?? "") });
        if (id === "keys") setKeys({ ENCRYPTION_KEY: String(body.ENCRYPTION_KEY), TELEGRAM_WEBHOOK_SECRET: String(body.TELEGRAM_WEBHOOK_SECRET) });
        dispatch({ type: "action", id, value: true });
        setActions((a) => ({ ...a, [id]: { status: "done" } }));
        if (id === "register" || id === "branch" || id === "sync") onChanged();
      } catch (err) {
        const message = (err as Error).message;
        setActions((a) => ({ ...a, [id]: { status: "error", message: /GITHUB_TOKEN/.test(message) ? tr(lang, UI.githubMissing) : message } }));
      }
    },
    [state, keys, lang, dispatch, onChanged],
  );

  // Client view: ←/→ move between steps (mirrored in Arabic), Esc leaves.
  useEffect(() => {
    if (!clientView) return;
    const onKey = (event: KeyboardEvent) => {
      if (howto) return;
      const index = STEP_IDS.indexOf(state.current);
      const forward = lang === "ar" ? "ArrowLeft" : "ArrowRight";
      const backward = lang === "ar" ? "ArrowRight" : "ArrowLeft";
      if (event.key === forward && index < STEP_IDS.length - 1) rawDispatch({ type: "go", step: STEP_IDS[index + 1] });
      if (event.key === backward && index > 0) rawDispatch({ type: "go", step: STEP_IDS[index - 1] });
      if (event.key === "Escape") setClientView(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [clientView, state, lang, howto]);

  const dir = lang === "ar" ? "rtl" : "ltr";
  const langToggle = (
    <div className="seg qs-lang" role="group" aria-label="Language">
      <button type="button" className="press" aria-pressed={lang === "ar"} onClick={() => setLang("ar")}>
        عربي
      </button>
      <button type="button" className="press" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
        EN
      </button>
    </div>
  );

  // ───────────────────────────── start screen
  if (!open) {
    return (
      <section className="boti__panel qs" lang={lang} dir={dir}>
        <div className="qs-hero card">
          <div className="qs-hero__glow" aria-hidden="true" />
          <div className="qs-hero__top">{langToggle}</div>
          <div className="qs-hero__content">
            <span className="qs-hero__mark" aria-hidden="true">
              <SparkIcon size={30} />
            </span>
            <h2>{tr(lang, UI.heading)}</h2>
            <p className="muted">{tr(lang, UI.intro)}</p>
            <ol className="qs-hero__steps">
              {WORK.map((id, n) => {
                const Icon = ICONS[id];
                return (
                  <li key={id} style={{ ["--i" as string]: n }}>
                    <span className="qs-hero__icon">
                      <Icon size={18} />
                    </span>
                    {tr(lang, STEP_TEXT[id].title)}
                  </li>
                );
              })}
            </ol>
            <button type="button" className="btn press qs-hero__cta" onClick={start}>
              {tr(lang, UI.start)}
            </button>
          </div>
        </div>

        {list && list.length ? (
          <div className="qs-list">
            <h3>{tr(lang, UI.inProgress)}</h3>
            <ul>
              {list.map((s, n) => (
                <li key={s.name} className="card qs-list__item" style={{ ["--i" as string]: n }}>
                  <ProgressRing value={s.progress} size={52} stroke={5} label={s.finished ? <DrawnCheck size={18} /> : undefined} />
                  <div className="qs-list__text">
                    <strong>{s.brand || s.name}</strong>
                    <span className="hint" dir="ltr">
                      {s.name} · {ago(s.updated_at)}
                    </span>
                  </div>
                  <div className="qs-list__actions">
                    <button type="button" className="btn btn--xs press" onClick={() => void resume(s.name)}>
                      {tr(lang, UI.resume)}
                    </button>
                    <button type="button" className="btn btn--xs btn--soft press" onClick={() => void remove(s.name)}>
                      {tr(lang, UI.remove)}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    );
  }

  // ───────────────────────────── a setup
  const step = state.current;
  const index = STEP_IDS.indexOf(step);
  const text = STEP_TEXT[step];
  const Icon = ICONS[step];
  const status = state.steps[step];
  const problems = stepProblems(state, step);
  const optional = OPTIONAL_STEPS.includes(step);
  const pct = progress(state);
  const workIndex = WORK.indexOf(step as (typeof WORK)[number]);
  const firstProblem = problems[0];
  const problemText = firstProblem ? tr(lang, PROBLEMS[firstProblem.startsWith("task:") ? "task" : firstProblem] ?? PROBLEMS.task) : "";

  const go = (target: StepId) => dispatch({ type: "go", step: target });

  const footer = (
    <div className="qs-footer">
      <button type="button" className="btn btn--sm btn--ghost press" disabled={index === 0} onClick={() => go(STEP_IDS[index - 1])}>
        {tr(lang, UI.back)}
      </button>
      <div className="qs-footer__main">
        {step !== "done" && status === "done" ? (
          <>
            <button type="button" className="btn btn--sm btn--soft press" onClick={() => dispatch({ type: "reopen", step })}>
              {tr(lang, UI.reopen)}
            </button>
            <button type="button" className="btn btn--sm press" onClick={() => go(STEP_IDS[index + 1])}>
              {tr(lang, UI.next)}
            </button>
          </>
        ) : step !== "done" ? (
          <>
            {optional ? (
              <button type="button" className="btn btn--sm btn--soft press" onClick={() => dispatch({ type: "skip", step })}>
                {tr(lang, UI.skip)}
              </button>
            ) : null}
            <button
              type="button"
              className="btn btn--sm press"
              disabled={problems.length > 0}
              aria-describedby={problems.length ? "qs-blocker" : undefined}
              onClick={() => dispatch({ type: "complete", step })}
            >
              {step === "welcome" ? tr(lang, UI.next) : tr(lang, UI.complete)}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );

  const stepCard = (
    <article className="card qs-step" key={step} data-status={status}>
      <header className="qs-step__head">
        <span className="qs-step__icon" aria-hidden="true">
          {status === "done" ? <DrawnCheck size={22} /> : <Icon size={22} />}
        </span>
        <div className="qs-step__titles">
          {step !== "done" ? (
            <span className="qs-step__count">
              {tr(lang, UI.step)} {workIndex + 1} {tr(lang, UI.of)} {WORK.length}
            </span>
          ) : null}
          <h3>{clientView ? tr(lang, text.client) : tr(lang, text.title)}</h3>
          <p className="muted">{tr(lang, text.goal)}</p>
        </div>
        {text.howto.length ? (
          <button type="button" className="btn btn--xs btn--ghost press qs-step__howto" onClick={() => setHowto(true)}>
            {tr(lang, UI.howto)}
          </button>
        ) : null}
      </header>

      {step === "done" ? (
        <DoneSummary state={state} lang={lang} />
      ) : (
        <StepBody step={step} state={state} dispatch={dispatch} lang={lang} clientView={clientView} actions={actions} run={run} keys={keys} health={health} />
      )}

      {problems.length && step !== "done" && status !== "done" ? (
        <p className="hint qs-blocker" id="qs-blocker">
          {problemText}
        </p>
      ) : null}
      {footer}
    </article>
  );

  const rail = (
    <nav className="qs-rail" aria-label={tr(lang, UI.heading)}>
      <ol>
        {STEP_IDS.map((id, n) => {
          const S = ICONS[id];
          const s = state.steps[id];
          return (
            <li key={id}>
              <button type="button" className="qs-rail__item press" aria-current={id === step ? "step" : undefined} data-status={s} onClick={() => go(id)}>
                <span className="qs-rail__dot">{s === "done" ? <DrawnCheck size={14} /> : <S size={15} />}</span>
                <span className="qs-rail__label">{tr(lang, STEP_TEXT[id].title)}</span>
                <span className="qs-rail__status">{tr(lang, UI.status[s])}</span>
              </button>
              {n < STEP_IDS.length - 1 ? <span className="qs-rail__line" data-done={s === "done" || s === "skipped" || undefined} aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );

  return (
    <section className={`boti__panel qs ${clientView ? "qs--client" : ""}`} lang={lang} dir={dir}>
      <p className="qs-sr" aria-live="polite">
        {`${tr(lang, text.title)} — ${tr(lang, text.goal)}`}
      </p>

      <div className="qs-top boti__no-print">
        <div className="qs-top__title">
          <ProgressRing value={pct} size={clientView ? 120 : 48} stroke={clientView ? 9 : 5} />
          <div>
            <strong>{state.inputs.brand || state.inputs.client || tr(lang, UI.heading)}</strong>
            {!clientView ? (
              <span className="hint" dir="ltr">
                {state.inputs.client ? `client/${state.inputs.client}` : ""}
              </span>
            ) : null}
          </div>
        </div>
        <div className="qs-top__tools">
          {!clientView ? (
            <span className="hint qs-save" aria-live="polite">
              {save === "saving" ? tr(lang, UI.saving) : save === "saved" ? tr(lang, UI.saved) : save === "error" ? tr(lang, UI.saveFailed) : ""}
            </span>
          ) : null}
          {langToggle}
          <button type="button" className="btn btn--xs btn--soft press" aria-pressed={clientView} onClick={() => setClientView((v) => !v)}>
            {clientView ? tr(lang, UI.exitClientView) : tr(lang, UI.clientView)}
          </button>
          {!clientView ? (
            <button type="button" className="btn btn--xs btn--ghost press" onClick={close}>
              {tr(lang, UI.close)}
            </button>
          ) : null}
        </div>
      </div>

      <div className="qs-layout">
        {!clientView ? rail : null}
        {stepCard}
      </div>

      {clientView ? (
        <div className="qs-dots boti__no-print" aria-hidden="true">
          {WORK.map((id) => (
            <span key={id} data-status={state.steps[id]} data-current={id === step || undefined} />
          ))}
        </div>
      ) : null}

      <HowToDrawer open={howto} onClose={() => setHowto(false)} guides={text.howto} lang={lang} title={`${tr(lang, UI.howto)} · ${tr(lang, text.title)}`} />
    </section>
  );
}

function DoneSummary({ state, lang }: { state: SetupState; lang: Lang }) {
  const i = state.inputs;
  const rows: { label: string; value: string; href?: string }[] = [
    { label: tr(lang, UI.brand), value: i.brand },
    { label: tr(lang, UI.clientName), value: i.client },
    { label: tr(lang, UI.store), value: i.domain ? `https://${i.domain}` : "—", href: i.domain ? `https://${i.domain}` : undefined },
    { label: tr(lang, UI.panel), value: i.domain ? `https://${i.domain}/admin/` : "—", href: i.domain ? `https://${i.domain}/admin/` : undefined },
    { label: tr(lang, UI.bot), value: i.bot_username ? `@${i.bot_username}` : "—", href: i.bot_username ? `https://t.me/${i.bot_username}` : undefined },
    { label: "GitHub", value: i.repo || "—", href: i.repo ? `https://github.com/${i.repo}` : undefined },
    { label: "Supabase", value: i.supabase_ref || "—" },
    { label: tr(lang, UI.ownerEmail), value: i.owner_email || "—" },
  ];
  return (
    <div className="qs-done">
      <Confetti />
      <div className="qs-done__badge" aria-hidden="true">
        <DrawnCheck size={40} />
      </div>
      <h4>{tr(lang, UI.doneTitle)}</h4>
      <p className="muted">{tr(lang, UI.doneText)}</p>
      <dl className="qs-done__rows">
        {rows.map((row, n) => (
          <div key={row.label} style={{ ["--i" as string]: n }}>
            <dt>{row.label}</dt>
            <dd dir="ltr">
              {row.href ? (
                <a href={row.href} target="_blank" rel="noopener noreferrer">
                  {row.value} <ExternalIcon size={12} />
                </a>
              ) : (
                row.value
              )}
            </dd>
          </div>
        ))}
      </dl>
      <button type="button" className="btn btn--sm btn--soft press boti__no-print" onClick={() => window.print()}>
        <PrintIcon size={14} /> {tr(lang, UI.print)}
      </button>
    </div>
  );
}
