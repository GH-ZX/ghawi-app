import { describe, expect, it } from "vitest";
import {
  canComplete,
  isFinished,
  newSetup,
  progress,
  refFromUrl,
  sanitizeState,
  type SetupAction,
  type SetupState,
  setupReducer,
  stepProblems,
  TASKS,
} from "../src/lib/boti/setup";
import { STEP_TEXT, TASK_TEXT } from "../src/lib/boti/setup-content";

const apply = (state: SetupState, ...actions: SetupAction[]) => actions.reduce(setupReducer, state);
const tickAll = (step: keyof typeof TASKS): SetupAction[] => TASKS[step].map((t) => ({ type: "task", id: t.id, value: true }));

describe("quick setup reducer", () => {
  it("starts on welcome and blocks it until name and brand are valid", () => {
    const s = newSetup();
    expect(s.current).toBe("welcome");
    expect(s.steps.welcome).toBe("active");
    expect(stepProblems(s, "welcome")).toEqual(["client", "brand"]);
    expect(setupReducer(s, { type: "complete", step: "welcome" })).toBe(s);
  });

  it("normalises inputs (slug, @username, domain, Supabase ref) and mirrors the Worker name", () => {
    const s = apply(
      newSetup(),
      { type: "input", key: "client", value: "Sara Store!" },
      { type: "input", key: "bot_username", value: "@SaraStoreBot" },
      { type: "input", key: "domain", value: "https://Store.Example.com/admin" },
      { type: "input", key: "supabase_url", value: "https://abcd1234.supabase.co" },
    );
    expect(s.inputs.client).toBe("sarastore");
    expect(s.inputs.worker_name).toBe("sarastore");
    expect(s.inputs.bot_username).toBe("SaraStoreBot");
    expect(s.inputs.domain).toBe("store.example.com");
    expect(s.inputs.supabase_ref).toBe("abcd1234");
    expect(refFromUrl("https://x.example.com")).toBe("");
  });

  it("completes a step only when its required tasks and actions are done, then moves on", () => {
    let s = apply(newSetup(), { type: "input", key: "client", value: "sara" }, { type: "input", key: "brand", value: "Sara" }, { type: "complete", step: "welcome" });
    expect(s.steps.welcome).toBe("done");
    expect(s.current).toBe("telegram");

    s = apply(s, { type: "input", key: "bot_username", value: "SaraBot" });
    expect(canComplete(s, "telegram")).toBe(false); // tasks not ticked
    s = apply(s, ...tickAll("telegram"), { type: "complete", step: "telegram" });
    expect(s.current).toBe("github");

    s = apply(s, { type: "input", key: "repo", value: "sara/store" }, ...tickAll("github"));
    expect(stepProblems(s, "github")).toEqual(["action:deploy_key"]);
    s = apply(s, { type: "action", id: "deploy_key", value: true }, { type: "complete", step: "github" });
    expect(s.steps.github).toBe("done");
  });

  it("skips only optional steps, and finishing every step marks done", () => {
    let s = newSetup();
    expect(setupReducer(s, { type: "skip", step: "github" })).toBe(s);
    s = apply(
      s,
      { type: "input", key: "client", value: "sara" },
      { type: "input", key: "brand", value: "Sara" },
      { type: "input", key: "bot_username", value: "SaraBot" },
      { type: "input", key: "repo", value: "sara/store" },
      { type: "input", key: "supabase_url", value: "https://abcd.supabase.co" },
      { type: "input", key: "owner_email", value: "owner@example.com" },
      ...(["telegram", "github", "supabase", "cloudflare", "live"] as const).flatMap((step) => tickAll(step)),
      { type: "action", id: "deploy_key", value: true },
      { type: "action", id: "register", value: true },
      { type: "action", id: "branch", value: true },
      { type: "action", id: "sync", value: true },
    );
    for (const step of ["welcome", "telegram", "github", "supabase", "cloudflare"] as const) s = setupReducer(s, { type: "complete", step });
    expect(s.current).toBe("payments");
    s = apply(s, { type: "skip", step: "payments" }, { type: "complete", step: "live" });
    expect(s.steps.payments).toBe("skipped");
    expect(isFinished(s)).toBe(true);
    expect(s.steps.done).toBe("done");
    expect(s.current).toBe("done");
    expect(progress(s)).toBe(1);
  });

  it("the client id follows the store name until edited", () => {
    let s = apply(newSetup(), { type: "input", key: "brand", value: "Sara Store!" });
    expect(s.inputs.client).toBe("sara-store");
    expect(s.inputs.worker_name).toBe("sara-store");
    s = apply(s, { type: "input", key: "client", value: "sara" }, { type: "input", key: "brand", value: "Sara Shop" });
    expect(s.inputs.client).toBe("sara");
    expect(apply(newSetup(), { type: "input", key: "brand", value: "متجر سارة" }).inputs.client).toBe("");
  });

  it("store language: both by default, or one of ar / en", () => {
    expect(newSetup().inputs.lang).toBe("both");
    expect(setupReducer(newSetup(), { type: "input", key: "lang", value: "en" }).inputs.lang).toBe("en");
    expect(setupReducer(newSetup(), { type: "input", key: "lang", value: "xx" }).inputs.lang).toBe("both");
    expect(sanitizeState({ inputs: { lang: "ar" } })!.inputs.lang).toBe("ar");
  });

  it("reopens a finished step", () => {
    const s = apply(newSetup(), { type: "input", key: "client", value: "sara" }, { type: "input", key: "brand", value: "Sara" }, { type: "complete", step: "welcome" }, { type: "reopen", step: "welcome" });
    expect(s.steps.welcome).toBe("active");
    expect(s.current).toBe("welcome");
  });
});

describe("what gets stored", () => {
  it("keeps only whitelisted non-secret inputs and known ids", () => {
    const raw = {
      current: "github",
      steps: { welcome: "done", github: "active", telegram: "nonsense" },
      tasks: { "telegram.newbot": true, "evil.task": true, "github.repo": "yes" },
      actions: { deploy_key: true, rm_rf: true },
      inputs: {
        client: "sara",
        brand: "Sara",
        repo: "sara/store",
        TELEGRAM_BOT_TOKEN: "123:AAH-secret",
        service_role: "eyJ.secret",
        password: "hunter2",
        public_key: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK boti deploy sara",
        lang: "fr",
      },
    };
    const s = sanitizeState(raw)!;
    expect(s.current).toBe("github");
    expect(s.steps.welcome).toBe("done");
    expect(s.steps.telegram).toBe("todo");
    expect(s.tasks).toEqual({ "telegram.newbot": true });
    expect(s.actions).toEqual({ deploy_key: true });
    expect(Object.keys(s.inputs).sort()).toEqual(
      ["brand", "bot_username", "client", "domain", "lang", "owner_email", "public_key", "repo", "supabase_ref", "supabase_url", "worker_name"].sort(),
    );
    expect(JSON.stringify(s)).not.toMatch(/secret|hunter2|AAH/);
    expect(s.inputs.lang).toBe("both");
  });

  it("drops a public key that isn't an ssh-ed25519 key, and rejects junk", () => {
    expect(sanitizeState({ inputs: { public_key: "-----BEGIN OPENSSH PRIVATE KEY-----" } })!.inputs.public_key).toBe("");
    expect(sanitizeState(null)).toBeNull();
    expect(sanitizeState("x")).toBeNull();
  });
});

describe("texts", () => {
  it("every step and task has English and Arabic", () => {
    for (const [id, text] of Object.entries(STEP_TEXT)) {
      expect(text.title.en && text.title.ar, id).toBeTruthy();
      expect(text.goal.en && text.goal.ar, id).toBeTruthy();
    }
    for (const task of Object.values(TASKS).flat()) {
      expect(TASK_TEXT[task.id]?.en && TASK_TEXT[task.id]?.ar, task.id).toBeTruthy();
    }
  });
});
