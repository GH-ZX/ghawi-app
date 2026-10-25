/*
 * Quick setup: the guided onboarding of a new client store, one step at a time.
 *
 * Pure state + rules, shared by the page, the API route and the tests. Only
 * non-secret facts are ever stored (names, repo, Supabase ref/URL, domain, bot
 * username, owner email, ticked tasks). Tokens, passwords, service_role keys,
 * API keys and the generated ENCRYPTION_KEY / TELEGRAM_WEBHOOK_SECRET never are.
 */

export const STEP_IDS = ["welcome", "telegram", "github", "supabase", "cloudflare", "payments", "live", "done"] as const;
export type StepId = (typeof STEP_IDS)[number];

export type StepStatus = "todo" | "active" | "done" | "skipped";
/** The coder's interface language. */
export type Lang = "en" | "ar";
/** The store's languages: both by default (customers pick in the bot). */
export type StoreLang = "both" | "ar" | "en";

/** Non-secret facts typed during setup. Anything not listed here is dropped before saving. */
export type SetupInputs = {
  client: string;
  brand: string;
  lang: StoreLang;
  bot_username: string;
  repo: string;
  supabase_url: string;
  supabase_ref: string;
  owner_email: string;
  worker_name: string;
  domain: string;
  /** The deploy key's PUBLIC half (safe to keep: it only goes into the client's repo settings). */
  public_key: string;
};

export type SetupState = {
  version: 1;
  current: StepId;
  steps: Record<StepId, StepStatus>;
  /** Ticked checklist items, e.g. "telegram.newbot". */
  tasks: Record<string, boolean>;
  inputs: SetupInputs;
  /** boti actions that ran (deploy key, register, branch, sync). */
  actions: Record<string, boolean>;
};

export const EMPTY_INPUTS: SetupInputs = {
  client: "",
  brand: "",
  lang: "both",
  bot_username: "",
  repo: "",
  supabase_url: "",
  supabase_ref: "",
  owner_email: "",
  worker_name: "",
  domain: "",
  public_key: "",
};

/** Steps the client may skip (payments are each optional; the whole step can be skipped). */
export const OPTIONAL_STEPS: readonly StepId[] = ["payments"];

/** Checklist items per step. `required` items must be ticked before the step can be completed. */
export const TASKS: Record<StepId, { id: string; required: boolean }[]> = {
  welcome: [],
  telegram: [
    { id: "telegram.newbot", required: true },
    { id: "telegram.token", required: true },
    { id: "telegram.inline", required: false },
  ],
  github: [
    { id: "github.account", required: true },
    { id: "github.repo", required: true },
    { id: "github.deploykey", required: true },
  ],
  supabase: [
    { id: "supabase.project", required: true },
    { id: "supabase.migrate", required: true },
    { id: "supabase.admin", required: true },
    { id: "supabase.signups", required: true },
  ],
  cloudflare: [
    { id: "cloudflare.import", required: true },
    { id: "cloudflare.secrets", required: true },
    { id: "cloudflare.domain", required: false },
  ],
  payments: [
    { id: "payments.nowpayments", required: false },
    { id: "payments.binance", required: false },
    { id: "payments.shamcash", required: false },
  ],
  live: [
    { id: "live.signin", required: true },
    { id: "live.webhook", required: true },
    { id: "live.commands", required: true },
    { id: "live.start", required: true },
    { id: "live.order", required: false },
  ],
  done: [],
};

/** boti actions a step needs before it can be completed. */
export const REQUIRED_ACTIONS: Partial<Record<StepId, string[]>> = {
  github: ["deploy_key"],
  cloudflare: ["register", "branch", "sync"],
};

export const CLIENT_SLUG = /^[a-z0-9][a-z0-9-]{1,30}$/;
const REPO = /^[A-Za-z0-9-]{1,39}\/[A-Za-z0-9._-]{1,100}$/;
const SUPABASE_URL = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/;
const WORKER = /^[a-z0-9][a-z0-9-]{0,62}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOMAIN = /^(?=.{3,253}$)[a-z0-9-]+(\.[a-z0-9-]+)+$/i;

export function newSetup(lang: StoreLang = "both"): SetupState {
  const steps = Object.fromEntries(STEP_IDS.map((id) => [id, "todo"])) as Record<StepId, StepStatus>;
  steps.welcome = "active";
  return { version: 1, current: "welcome", steps, tasks: {}, inputs: { ...EMPTY_INPUTS, lang }, actions: {} };
}

/** "Sara Store!" → "sara-store" (Latin letters and digits only; Arabic names give "" and are typed by hand). */
export function slugify(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 31).replace(/-+$/, "");
}

/** "abc" from "https://abc.supabase.co". */
export function refFromUrl(url: string): string {
  return /^https:\/\/([a-z0-9-]+)\.supabase\.co/.exec(url.trim())?.[1] ?? "";
}

/** example.com from "https://example.com/admin". */
export function cleanDomain(value: string): string {
  return value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

/** What still blocks a step, as message keys (see setup-content `problems`). Empty = ready. */
export function stepProblems(state: SetupState, id: StepId): string[] {
  const i = state.inputs;
  const out: string[] = [];
  if (id === "welcome") {
    if (!CLIENT_SLUG.test(i.client)) out.push("client");
    if (!i.brand.trim()) out.push("brand");
  }
  if (id === "telegram" && !/^[A-Za-z][A-Za-z0-9_]{3,31}$/.test(i.bot_username.replace(/^@/, ""))) out.push("bot_username");
  if (id === "github" && !REPO.test(i.repo)) out.push("repo");
  if (id === "supabase") {
    if (!SUPABASE_URL.test(i.supabase_url)) out.push("supabase_url");
    if (!EMAIL.test(i.owner_email)) out.push("owner_email");
  }
  if (id === "cloudflare") {
    if (!WORKER.test(i.worker_name)) out.push("worker_name");
    if (i.domain && !DOMAIN.test(i.domain)) out.push("domain");
  }
  for (const task of TASKS[id]) if (task.required && !state.tasks[task.id]) out.push(`task:${task.id}`);
  for (const action of REQUIRED_ACTIONS[id] ?? []) if (!state.actions[action]) out.push(`action:${action}`);
  return out;
}

export function canComplete(state: SetupState, id: StepId): boolean {
  return stepProblems(state, id).length === 0;
}

/** Steps counted in progress (the final "done" screen isn't a step of work). */
const WORK_STEPS = STEP_IDS.filter((id) => id !== "done");

/** 0..1, done and skipped steps count as finished. */
export function progress(state: SetupState): number {
  const finished = WORK_STEPS.filter((id) => state.steps[id] === "done" || state.steps[id] === "skipped").length;
  return finished / WORK_STEPS.length;
}

export function isFinished(state: SetupState): boolean {
  return WORK_STEPS.every((id) => state.steps[id] === "done" || state.steps[id] === "skipped");
}

export type SetupAction =
  | { type: "input"; key: keyof SetupInputs; value: string }
  | { type: "task"; id: string; value: boolean }
  | { type: "action"; id: string; value: boolean }
  | { type: "go"; step: StepId }
  | { type: "complete"; step: StepId }
  | { type: "skip"; step: StepId }
  | { type: "reopen"; step: StepId }
  | { type: "load"; state: SetupState };

function nextOpen(state: SetupState, from: StepId): StepId {
  const start = STEP_IDS.indexOf(from);
  for (let k = start + 1; k < STEP_IDS.length; k++) {
    const id = STEP_IDS[k];
    if (state.steps[id] !== "done" && state.steps[id] !== "skipped") return id;
  }
  return "done";
}

function focus(state: SetupState, step: StepId): SetupState {
  const steps = { ...state.steps };
  for (const id of STEP_IDS) if (steps[id] === "active") steps[id] = "todo";
  if (steps[step] === "todo") steps[step] = "active";
  return { ...state, current: step, steps };
}

/** The whole setup as a reducer, so every change is one predictable step. */
export function setupReducer(state: SetupState, action: SetupAction): SetupState {
  switch (action.type) {
    case "load":
      return action.state;
    case "input": {
      let value = action.value;
      if (action.key === "client" || action.key === "worker_name") value = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (action.key === "lang") value = value === "en" || value === "ar" ? value : "both";
      if (action.key === "domain") value = cleanDomain(value);
      if (action.key === "bot_username") value = value.trim().replace(/^@/, "");
      const inputs = { ...state.inputs, [action.key]: value } as SetupInputs;
      if (action.key === "supabase_url") inputs.supabase_ref = refFromUrl(value) || state.inputs.supabase_ref;
      // The client id follows the store name until it's edited on its own.
      if (action.key === "brand" && (!state.inputs.client || state.inputs.client === slugify(state.inputs.brand))) {
        const slug = slugify(value);
        if (slug.length >= 2) {
          inputs.client = slug;
          if (!state.inputs.worker_name || state.inputs.worker_name === state.inputs.client) inputs.worker_name = slug;
        }
      }
      // The Worker name follows the client name until it's edited on its own.
      if (action.key === "client" && (!state.inputs.worker_name || state.inputs.worker_name === state.inputs.client)) inputs.worker_name = value;
      return { ...state, inputs };
    }
    case "task":
      return { ...state, tasks: { ...state.tasks, [action.id]: action.value } };
    case "action":
      return { ...state, actions: { ...state.actions, [action.id]: action.value } };
    case "go":
      return focus(state, action.step);
    case "complete": {
      if (!canComplete(state, action.step)) return state;
      const done = { ...state, steps: { ...state.steps, [action.step]: "done" as StepStatus } };
      const next = nextOpen(done, action.step);
      if (next === "done" && isFinished(done)) done.steps.done = "done";
      return focus(done, next);
    }
    case "skip": {
      if (!OPTIONAL_STEPS.includes(action.step)) return state;
      const skipped = { ...state, steps: { ...state.steps, [action.step]: "skipped" as StepStatus } };
      const next = nextOpen(skipped, action.step);
      if (next === "done" && isFinished(skipped)) skipped.steps.done = "done";
      return focus(skipped, next);
    }
    case "reopen": {
      const steps = { ...state.steps, [action.step]: "todo" as StepStatus, done: "todo" as StepStatus };
      return focus({ ...state, steps }, action.step);
    }
  }
}

const INPUT_KEYS = Object.keys(EMPTY_INPUTS) as (keyof SetupInputs)[];
const STATUSES: StepStatus[] = ["todo", "active", "done", "skipped"];
const TASK_IDS = new Set(Object.values(TASKS).flat().map((t) => t.id));
const ACTION_IDS = new Set(["deploy_key", "register", "branch", "keys", "sync", "health"]);

/**
 * What may be stored: known steps/statuses, known task and action ids, and the
 * whitelisted non-secret inputs (strings, length-capped). Everything else —
 * including any token or key someone tries to slip in — is dropped.
 */
export function sanitizeState(raw: unknown): SetupState | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const base = newSetup();

  const steps = { ...base.steps };
  const rawSteps = (r.steps ?? {}) as Record<string, unknown>;
  for (const id of STEP_IDS) {
    const v = rawSteps[id];
    if (typeof v === "string" && STATUSES.includes(v as StepStatus)) steps[id] = v as StepStatus;
  }

  const tasks: Record<string, boolean> = {};
  for (const [k, v] of Object.entries((r.tasks ?? {}) as Record<string, unknown>)) if (TASK_IDS.has(k) && v === true) tasks[k] = true;

  const actions: Record<string, boolean> = {};
  for (const [k, v] of Object.entries((r.actions ?? {}) as Record<string, unknown>)) if (ACTION_IDS.has(k) && v === true) actions[k] = true;

  const inputs = { ...base.inputs };
  const rawInputs = (r.inputs ?? {}) as Record<string, unknown>;
  for (const key of INPUT_KEYS) {
    const v = rawInputs[key];
    if (typeof v === "string") (inputs as Record<string, string>)[key] = v.slice(0, key === "public_key" ? 200 : 120);
  }
  inputs.lang = inputs.lang === "en" || inputs.lang === "ar" ? inputs.lang : "both";
  if (inputs.public_key && !/^ssh-ed25519 [A-Za-z0-9+/=]+( [^\n]*)?$/.test(inputs.public_key)) inputs.public_key = "";

  const current = typeof r.current === "string" && (STEP_IDS as readonly string[]).includes(r.current) ? (r.current as StepId) : "welcome";
  return { version: 1, current, steps, tasks, inputs, actions };
}
