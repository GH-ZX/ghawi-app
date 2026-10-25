"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BotIcon, CardIcon, ChipIcon, CloudIcon, ExternalIcon, PrintIcon, RepoIcon, SendIcon, SparkIcon } from "@/components/icons";
import {
  CLIENT_SLUG,
  type Lang,
  newSetup,
  OPTIONAL_STEPS,
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

/** Guided onboarding of a new client store. The start screen lives in the console; a setup opens full screen. */
export function QuickSetup({ onChanged }: { onChanged: () => void }) {
  // Rendered only after the console loads on the client, so localStorage is safe to read here.
  const [lang, setLangState] = useState<Lang>(() => (typeof window === "undefined" ? "ar" : readLang()));
  const [list, setList] = useState<SetupSummary[] | null>(null);
  const [state, rawDispatch] = useReducer(setupReducer, undefined, () => newSetup());
  const [open, setOpen] = useState(false);
  const [howto, setHowto] = useState(false);
  const [actions, setActions] = useState<Partial<Record<ActionId, ActionState>>>({});
  const [keys, setKeys] = useState<Keys | null>(null);
  const [health, setHealth] = useState<Health>(null);
  const [save, setSave] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [direction, setDirection] = useState<"fwd" | "back">("fwd");
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

  function enter(next: SetupState) {
    rawDispatch({ type: "load", state: next });
    dirty.current = false;
    setKeys(null);
    setHealth(null);
    setActions({});
    setSave("idle");
    setDirection("fwd");
    setOpen(true);
  }

  async function resume(name: string) {
    const body = await api<{ setup: { state: SetupState | null } | null }>(`/api/boti/setup?name=${encodeURIComponent(name)}`);
    if (body.setup?.state) enter(body.setup.state);
  }

  async function remove(name: string) {
    if (!window.confirm(tr(lang, UI.removeConfirm))) return;
    await api(`/api/boti/setup?name=${encodeURIComponent(name)}`, { method: "DELETE" }).catch(() => null);
    setListVersion((v) => v + 1);
  }

  const exit = useCallback(() => {
    setOpen(false);
    setHowto(false);
    setListVersion((v) => v + 1);
  }, []);

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

  return (
    <>
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
            <button type="button" className="btn press qs-hero__cta" onClick={() => enter(newSetup())}>
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

      {open
        ? createPortal(
            <Stage
              state={state}
              dispatch={dispatch}
              lang={lang}
              dir={dir}
              langToggle={langToggle}
              save={save}
              direction={direction}
              setDirection={setDirection}
              actions={actions}
              run={run}
              keys={keys}
              health={health}
              howto={howto}
              setHowto={setHowto}
              exit={exit}
            />,
            document.body,
          )
        : null}
    </>
  );
}

export type StageProps = {
  state: SetupState;
  dispatch: (action: SetupAction) => void;
  lang: Lang;
  dir: "rtl" | "ltr";
  langToggle: React.ReactNode;
  save: "idle" | "saving" | "saved" | "error";
  direction: "fwd" | "back";
  setDirection: (d: "fwd" | "back") => void;
  actions: Partial<Record<ActionId, ActionState>>;
  run: (id: ActionId) => void;
  keys: Keys | null;
  health: Health;
  howto: boolean;
  setHowto: (open: boolean) => void;
  exit: () => void;
};

/** The full-screen setup: one centred step at a time, Setup Assistant style. */
export function Stage(props: StageProps) {
  const { state, dispatch, lang, dir, langToggle, save, direction, setDirection, actions, run, keys, health, howto, setHowto, exit } = props;
  const step = state.current;
  const index = STEP_IDS.indexOf(step);
  const text = STEP_TEXT[step];
  const Icon = ICONS[step];
  const status = state.steps[step];
  const problems = stepProblems(state, step);
  const optional = OPTIONAL_STEPS.includes(step);
  const workIndex = WORK.indexOf(step as (typeof WORK)[number]);
  const first = problems[0];
  const blocker = first ? tr(lang, PROBLEMS[first.startsWith("task:") ? "task" : first] ?? PROBLEMS.task) : "";
  const blockedByDetails = problems.some((p) => p.startsWith("action:") || p === "client");
  const title = useRef<HTMLHeadingElement>(null);

  // The page behind stays still; focus lands on each new step's title.
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);
  useEffect(() => {
    title.current?.focus({ preventScroll: true });
  }, [step]);

  const go = (target: StepId) => {
    setDirection(STEP_IDS.indexOf(target) >= index ? "fwd" : "back");
    dispatch({ type: "go", step: target });
  };

  let primary: { label: string; onClick: () => void; disabled?: boolean };
  if (step === "done") primary = { label: tr(lang, UI.finish), onClick: exit };
  else if (status === "done") primary = { label: tr(lang, UI.continue), onClick: () => go(STEP_IDS[index + 1]) };
  else
    primary = {
      label: step === "welcome" ? tr(lang, UI.getStarted) : tr(lang, UI.continue),
      disabled: problems.length > 0,
      onClick: () => {
        setDirection("fwd");
        dispatch({ type: "complete", step });
      },
    };

  return (
    <div className="qs-stage" lang={lang} dir={dir} role="dialog" aria-modal="true" aria-label={tr(lang, UI.heading)}>
      <div className="qs-stage__backdrop" aria-hidden="true">
        <span className="qs-blob qs-blob--1" />
        <span className="qs-blob qs-blob--2" />
        <span className="qs-blob qs-blob--3" />
      </div>

      <header className="qs-stage__bar">
        <button type="button" className="qs-exit press" onClick={exit}>
          {tr(lang, UI.exit)}
        </button>
        <span className="qs-stage__brand" dir="auto">
          {state.inputs.brand || ""}
        </span>
        <div className="qs-stage__tools">
          <span className="qs-save" aria-live="polite">
            {save === "saving" ? tr(lang, UI.saving) : save === "saved" ? tr(lang, UI.saved) : save === "error" ? tr(lang, UI.saveFailed) : ""}
          </span>
          {langToggle}
        </div>
      </header>

      <main className="qs-stage__main">
        <div className="qs-screen" key={step} data-dir={direction} data-status={status}>
          <span className="qs-screen__icon" aria-hidden="true">
            {status === "done" || step === "done" ? <DrawnCheck size={30} /> : <Icon size={30} />}
          </span>
          {step !== "done" ? (
            <p className="qs-screen__eyebrow">
              {tr(lang, UI.step)} {workIndex + 1} {tr(lang, UI.of)} {WORK.length}
              {status === "done" ? ` · ${tr(lang, UI.status.done)}` : status === "skipped" ? ` · ${tr(lang, UI.status.skipped)}` : ""}
            </p>
          ) : null}
          <h1 className="qs-screen__title" tabIndex={-1} ref={title}>
            {step === "done" ? tr(lang, UI.doneTitle) : tr(lang, text.client)}
          </h1>
          <p className="qs-screen__sub">{step === "done" ? tr(lang, UI.doneText) : tr(lang, text.goal)}</p>
          {text.howto.length ? (
            <button type="button" className="qs-howto press" onClick={() => setHowto(true)}>
              {tr(lang, UI.howto)}
            </button>
          ) : null}

          {step === "done" ? (
            <DoneSummary state={state} lang={lang} />
          ) : (
            <StepBody step={step} state={state} dispatch={dispatch} lang={lang} actions={actions} run={run} keys={keys} health={health} />
          )}
        </div>
      </main>

      <footer className="qs-stage__foot">
        {problems.length && step !== "done" && status !== "done" ? (
          <p className="qs-blocker" id="qs-blocker">
            {blockedByDetails ? tr(lang, UI.detailsNeeded) : blocker}
          </p>
        ) : null}
        <button
          type="button"
          className="qs-primary press"
          disabled={primary.disabled}
          aria-describedby={primary.disabled ? "qs-blocker" : undefined}
          onClick={primary.onClick}
        >
          {primary.label}
        </button>
        <div className="qs-secondary">
          {index > 0 ? (
            <button type="button" className="qs-text-btn press" onClick={() => go(STEP_IDS[index - 1])}>
              {tr(lang, UI.back)}
            </button>
          ) : (
            <span />
          )}
          <div className="qs-secondary__end">
            {optional && status !== "done" && status !== "skipped" ? (
              <button
                type="button"
                className="qs-text-btn press"
                onClick={() => {
                  setDirection("fwd");
                  dispatch({ type: "skip", step });
                }}
              >
                {tr(lang, UI.skip)}
              </button>
            ) : null}
            {step !== "done" && status === "done" ? (
              <button type="button" className="qs-text-btn press" onClick={() => dispatch({ type: "reopen", step })}>
                {tr(lang, UI.reopen)}
              </button>
            ) : null}
          </div>
        </div>
        <nav className="qs-dots" aria-label={tr(lang, UI.stepsNav)}>
          {WORK.map((id, n) => (
            <button
              key={id}
              type="button"
              className="qs-dot"
              data-status={state.steps[id]}
              aria-current={id === step ? "step" : undefined}
              aria-label={`${tr(lang, UI.goToStep)} ${n + 1}: ${tr(lang, STEP_TEXT[id].title)} (${tr(lang, UI.status[state.steps[id]])})`}
              onClick={() => go(id)}
            />
          ))}
        </nav>
      </footer>

      <p className="qs-sr" aria-live="polite">
        {`${tr(lang, text.title)} — ${tr(lang, text.goal)}`}
      </p>

      <HowToDrawer open={howto} onClose={() => setHowto(false)} guides={text.howto} lang={lang} title={`${tr(lang, UI.howto)} · ${tr(lang, text.title)}`} />
    </div>
  );
}

function DoneSummary({ state, lang }: { state: SetupState; lang: Lang }) {
  const i = state.inputs;
  const rows: { label: string; value: string; href?: string }[] = [
    { label: tr(lang, UI.brand), value: i.brand },
    { label: tr(lang, UI.language), value: tr(lang, i.lang === "both" ? UI.langBoth : i.lang === "ar" ? UI.langAr : UI.langEn) },
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
      <dl className="qs-done__rows">
        {rows.map((row, n) => (
          <div key={row.label} style={{ ["--i" as string]: n }}>
            <dt>{row.label}</dt>
            <dd dir="auto">
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
      <button type="button" className="qs-pill press" onClick={() => window.print()}>
        <PrintIcon size={14} /> {tr(lang, UI.print)}
      </button>
    </div>
  );
}
