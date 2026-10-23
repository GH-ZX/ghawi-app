"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ExternalIcon } from "@/components/icons";
import {
  AVAILABILITY,
  CASE_SLUGS,
  CHANNEL_IDS,
  HERO_CHANNELS,
  ICON_NAMES,
  PROOF_ANCHORS,
  SECTION_KEYS,
  type Dictionary,
  type SiteContent,
} from "@/lib/content";
import { itemTemplate } from "@/lib/site-content";

/*
 * Admin → Site. Every word, link and number on ghawi.app/en and /ar (and the
 * CV and case studies), both languages side by side. The fields are drawn
 * from the defaults' own shape, so anything the page shows can be edited here
 * and nothing here can break the page: the server reshapes every save.
 */

type Status = "loading" | "idle" | "saving" | "saved" | "error";
type Path = (string | number)[];
type Lang = "en" | "ar";

type DictKey = keyof Dictionary;
type Group = { id: string; label: string; keys: DictKey[]; note?: string };

const GROUPS: Group[] = [
  { id: "meta", label: "Search & sharing", keys: ["meta", "person"], note: "The title and description Google and link previews show." },
  { id: "hero", label: "Hero", keys: ["hero"], note: "The first screen. The badge colour is under Basics → Availability." },
  { id: "work", label: "Work · GH Store", keys: ["work", "store"] },
  { id: "bot", label: "Work · client bot", keys: ["bot"] },
  { id: "projects", label: "Work · other", keys: ["projects", "more"] },
  { id: "testimonials", label: "Testimonials", keys: ["testimonials"], note: "The section appears once there is at least one quote with a name." },
  { id: "services", label: "Services", keys: ["services"] },
  { id: "pricing", label: "Pricing", keys: ["pricing"], note: "Leave a price empty to show the quote line instead." },
  { id: "process", label: "Process", keys: ["process"] },
  { id: "about", label: "About", keys: ["about"] },
  { id: "contact", label: "Contact & form", keys: ["contact"] },
  { id: "cases", label: "Case studies", keys: ["cases"] },
  { id: "chrome", label: "Menus & footer", keys: ["nav", "ui", "footer"] },
];

/** The CV has its own editor with a live preview, on its own subdomain. */
const CV_BUILDER = process.env.NODE_ENV === "production" ? "https://cv.ghawi.app/edit" : "/resume/edit";

/** Values that are the same in both languages: edited once, written to both. */
const SHARED = new Set(["icon", "topic", "proof", "href", "url", "stack", "id", "slug", "value:budgets", "value:topics"]);

/** Fixed by the code (media folders, page addresses): shown, not edited. */
const LOCKED = new Set(["id", "slug"]);

const HINTS: Record<string, string> = {
  titleAccent: "Must appear word for word in the title; it is set in colour.",
  proof: "Where “See an example” jumps to. Empty hides the link.",
  topic: "The form topic this button picks (a value from Contact → Topics).",
  price: "Shown after “From”. Empty shows the quote line.",
  whatsappText: "Typed into WhatsApp for the visitor when they open the chat.",
  status: "The badge above the title. Its colour is under Basics → Availability.",
  proof_hero: "One line of proof above the title.",
  value: "{products} becomes GH Store's live product count.",
  href: "A section on the page: #gh-store, #store-bot or #storefront.",
  period: "Free text, e.g. 2026 – Present.",
  org: "Leave empty to keep the organisation private.",
};

const humanize = (key: string) =>
  key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/\bcv\b/i, "CV")
    .replace(/\bcta\b/i, "Button");

const isPlain = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

/* ------------------------------------------------------------------ *
 *  Immutable updates by path
 * ------------------------------------------------------------------ */

function setIn<T>(root: T, path: Path, value: unknown): T {
  if (!path.length) return value as T;
  const [head, ...rest] = path;
  if (Array.isArray(root)) {
    const copy = root.slice();
    copy[head as number] = setIn(copy[head as number], rest, value);
    return copy as T;
  }
  const record = (root ?? {}) as Record<string, unknown>;
  return { ...record, [head]: setIn(record[head as string], rest, value) } as T;
}

function getIn(root: unknown, path: Path): unknown {
  return path.reduce<unknown>((node, key) => (node == null ? undefined : (node as Record<string | number, unknown>)[key]), root);
}

/** The options a shared choice offers, by key. */
function optionsFor(key: string, path: Path, content: SiteContent): string[] | null {
  if (key === "icon") return [...ICON_NAMES];
  if (key === "topic") return ["", ...content.en.contact.form.topics.map((t) => t.value)];
  if (key === "proof") return [...PROOF_ANCHORS];
  if (key === "href" && path[0] === "work") return PROOF_ANCHORS.filter(Boolean);
  if (key === "id" && path[0] === "contact") return [...CHANNEL_IDS];
  return null;
}

/* ------------------------------------------------------------------ */

export function SitePanel() {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [defaults, setDefaults] = useState<SiteContent | null>(null);
  const [saved, setSaved] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [products, setProducts] = useState(0);
  const [group, setGroup] = useState("basics");
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch("/api/admin/site/content", { signal: controller.signal, cache: "no-store" });
        if (response.status === 401) return router.refresh();
        if (!response.ok) throw new Error(String(response.status));
        const body = (await response.json()) as { content: SiteContent; defaults: SiteContent; updatedAt: string | null; products: number };
        setContent(body.content);
        setDefaults(body.defaults);
        setSaved(JSON.stringify(body.content));
        setUpdatedAt(body.updatedAt);
        setProducts(body.products);
        setStatus("idle");
      } catch {
        if (!controller.signal.aborted) setStatus("error");
      }
    })();
    return () => controller.abort();
  }, [router]);

  const dirty = content !== null && JSON.stringify(content) !== saved;

  // Leaving with unsaved edits asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save() {
    if (!content) return;
    setStatus("saving");
    try {
      const response = await fetch("/api/admin/site/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (response.status === 401) return router.refresh();
      if (!response.ok) throw new Error(String(response.status));
      const body = (await response.json()) as { content: SiteContent; updatedAt: string | null };
      setContent(body.content);
      setSaved(JSON.stringify(body.content));
      setUpdatedAt(body.updatedAt);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  async function resetAll() {
    if (!window.confirm("Put every word on the site back to the built-in defaults? Your saved edits are deleted.")) return;
    setStatus("saving");
    try {
      const response = await fetch("/api/admin/site/content", { method: "DELETE" });
      if (!response.ok) throw new Error(String(response.status));
      const body = (await response.json()) as { content: SiteContent };
      setContent(body.content);
      setSaved(JSON.stringify(body.content));
      setUpdatedAt(null);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  if (!content || !defaults) {
    return (
      <div className="empty">
        {status === "error" ? "Couldn't load the site's content. Refresh to try again." : <span className="spinner" aria-hidden="true" />}
      </div>
    );
  }

  const current = GROUPS.find((g) => g.id === group);

  /** Edit one language, or both at once (shared values and list shapes). */
  const write = (lang: Lang | "both", path: Path, value: unknown) =>
    setContent((c) => {
      if (!c) return c;
      if (lang === "both") return { ...c, en: setIn(c.en, path, value), ar: setIn(c.ar, path, value) };
      return { ...c, [lang]: setIn(c[lang], path, value) };
    });

  /** Lists stay parallel in both languages: add, move and remove happen in both. */
  const reshape = (path: Path, change: (list: unknown[]) => unknown[]) =>
    setContent((c) => {
      if (!c) return c;
      const next = (lang: Lang) => setIn(c[lang], path, change(((getIn(c[lang], path) as unknown[]) ?? []).slice()));
      return { ...c, en: next("en"), ar: next("ar") };
    });

  const resetGroup = () => {
    if (!current || !window.confirm(`Put “${current.label}” back to the defaults? (Saved only when you press Save.)`)) return;
    setContent((c) => {
      if (!c) return c;
      const en = { ...c.en };
      const ar = { ...c.ar };
      for (const key of current.keys) {
        (en as Record<string, unknown>)[key] = defaults.en[key];
        (ar as Record<string, unknown>)[key] = defaults.ar[key];
      }
      return { ...c, en, ar };
    });
  };

  return (
    <section className="sp" aria-labelledby="sp-title">
      <div className="theme-panel__head">
        <div>
          <h2 id="sp-title">Site content</h2>
          <p className="muted">
            Every word on ghawi.app, in English and Arabic. Saved changes are live within 30 seconds, no deploy.
            {updatedAt ? ` Last saved ${new Date(updatedAt).toLocaleString("en-GB")}.` : " Showing the built-in defaults."}
          </p>
        </div>
        <span className="sp__preview">
          <a className="btn btn--xs btn--ghost press" href="/en" target="_blank" rel="noopener noreferrer">
            /en <ExternalIcon size={13} />
          </a>
          <a className="btn btn--xs btn--ghost press" href="/ar" target="_blank" rel="noopener noreferrer">
            /ar <ExternalIcon size={13} />
          </a>
          <a className="btn btn--xs press" href={CV_BUILDER} target="_blank" rel="noopener noreferrer">
            CV builder <ExternalIcon size={13} />
          </a>
        </span>
      </div>

      <div className="sp__layout">
        <nav className="sp__groups" aria-label="Parts of the site">
          <button type="button" className="press" aria-pressed={group === "basics"} onClick={() => setGroup("basics")}>
            Basics
          </button>
          {GROUPS.map((g) => (
            <button key={g.id} type="button" className="press" aria-pressed={group === g.id} onClick={() => setGroup(g.id)}>
              {g.label}
            </button>
          ))}
        </nav>

        <div className="sp__body">
          {group === "basics" ? (
            <Basics content={content} setContent={setContent} products={products} onResetAll={resetAll} />
          ) : current ? (
            <>
              <div className="sp__group-head">
                <h3>{current.label}</h3>
                <button type="button" className="btn btn--xs btn--ghost press" onClick={resetGroup}>
                  Reset to defaults
                </button>
              </div>
              {current.note ? <p className="muted small sp__note">{current.note}</p> : null}
              {current.keys.map((key) => (
                <Node
                  key={key}
                  path={[key]}
                  model={defaults.en[key]}
                  en={content.en[key]}
                  ar={content.ar[key]}
                  content={content}
                  write={write}
                  reshape={reshape}
                  depth={0}
                />
              ))}
            </>
          ) : null}
        </div>
      </div>

      <div className="ivp__savebar" data-dirty={dirty || undefined}>
        <span className="muted small" role="status">
          {status === "saving"
            ? "Saving…"
            : status === "saved" && !dirty
              ? "Saved · live within 30 s"
              : status === "error"
                ? "Couldn't save. Check your connection and try again."
                : dirty
                  ? "Unsaved changes"
                  : "Everything saved"}
        </span>
        <span className="sp__save-actions">
          <button type="button" className="btn btn--xs btn--ghost press" disabled={!dirty} onClick={() => setContent(JSON.parse(saved) as SiteContent)}>
            Discard
          </button>
          <button type="button" className="btn btn--sm press" disabled={!dirty || status === "saving"} onClick={save}>
            Save
          </button>
        </span>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 *  The generic editor: one node of the dictionary, both languages
 * ------------------------------------------------------------------ */

type NodeProps = {
  path: Path;
  model: unknown;
  en: unknown;
  ar: unknown;
  content: SiteContent;
  write: (lang: Lang | "both", path: Path, value: unknown) => void;
  reshape: (path: Path, change: (list: unknown[]) => unknown[]) => void;
  depth: number;
};

function keyOf(path: Path): string {
  for (let i = path.length - 1; i >= 0; i -= 1) if (typeof path[i] === "string") return path[i] as string;
  return "";
}

/** "value" is shared in the topic and budget lists (machine words), per-language elsewhere. */
function isShared(path: Path): boolean {
  const key = keyOf(path);
  if (key === "value") {
    const list = path.filter((p) => typeof p === "string").slice(-2, -1)[0];
    return SHARED.has(`value:${list}`);
  }
  // A channel's id is a channel, not words.
  if (key === "id" && path[0] === "contact") return true;
  return SHARED.has(key);
}

function Node(props: NodeProps) {
  const { path, model } = props;
  if (typeof model === "string") return <TextPair {...props} />;
  if (typeof model === "boolean") return <Toggle {...props} />;
  if (Array.isArray(model)) return <List {...props} />;
  if (isPlain(model)) return <Group {...props} />;
  return <p className="muted small">Not editable: {path.join(".")}</p>;
}

function Group({ path, model, en, ar, content, write, reshape, depth }: NodeProps) {
  const record = model as Record<string, unknown>;
  const label = typeof path[path.length - 1] === "string" ? humanize(String(path[path.length - 1])) : "";
  const children = Object.keys(record).map((key) => (
    <Node
      key={key}
      path={[...path, key]}
      model={record[key]}
      en={(en as Record<string, unknown> | undefined)?.[key]}
      ar={(ar as Record<string, unknown> | undefined)?.[key]}
      content={content}
      write={write}
      reshape={reshape}
      depth={depth + 1}
    />
  ));
  if (depth === 0 || typeof path[path.length - 1] === "number") return <div className="sp__fields">{children}</div>;
  return (
    <fieldset className="sp__set">
      <legend>{label}</legend>
      <div className="sp__fields">{children}</div>
    </fieldset>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="sp__field">
      <span className="field__label">{label}</span>
      {children}
      {hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}

function TextPair({ path, model, en, ar, content, write }: NodeProps) {
  const key = keyOf(path);
  const label = typeof path[path.length - 1] === "number" ? `#${Number(path[path.length - 1]) + 1}` : humanize(key);
  const long = String(model).length > 80 || ["body", "lead", "description", "quote", "summary", "challenge", "result", "blurb"].includes(key);
  const hint = HINTS[key === "proof" && path[0] === "hero" ? "proof_hero" : key];
  const enValue = typeof en === "string" ? en : "";
  const arValue = typeof ar === "string" ? ar : "";

  if (LOCKED.has(key) && !(key === "id" && path[0] === "contact")) {
    return (
      <Field label={label} hint="Fixed: the page's address and media depend on it.">
        <code className="sp__locked">{enValue}</code>
      </Field>
    );
  }

  if (isShared(path)) {
    const options = optionsFor(key, path, content);
    return (
      <Field label={label} hint={hint}>
        {options ? (
          <select className="select" value={enValue} onChange={(event) => write("both", path, event.target.value)}>
            {options.includes(enValue) ? null : <option value={enValue}>{enValue || "—"}</option>}
            {options.map((option) => (
              <option key={option} value={option}>
                {option || "— none —"}
              </option>
            ))}
          </select>
        ) : (
          <input className="input" dir="ltr" value={enValue} onChange={(event) => write("both", path, event.target.value)} />
        )}
      </Field>
    );
  }

  const input = (lang: Lang, value: string) =>
    long ? (
      <textarea
        className="textarea sp__text"
        dir={lang === "ar" ? "rtl" : "ltr"}
        lang={lang}
        rows={Math.min(8, Math.max(2, Math.ceil(value.length / 70)))}
        value={value}
        onChange={(event) => write(lang, path, event.target.value)}
      />
    ) : (
      <input className="input" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang} value={value} onChange={(event) => write(lang, path, event.target.value)} />
    );

  return (
    <Field label={label} hint={hint}>
      <div className="sp__pair">
        <label className="sp__lang">
          <span>EN</span>
          {input("en", enValue)}
        </label>
        <label className="sp__lang">
          <span>ع</span>
          {input("ar", arValue)}
        </label>
      </div>
    </Field>
  );
}

function Toggle({ path, en, write }: NodeProps) {
  return (
    <label className="ivp__check sp__toggle">
      <input type="checkbox" checked={en === true} onChange={(event) => write("both", path, event.target.checked)} />
      {humanize(keyOf(path))}
    </label>
  );
}

/** A short title for a list item's card, from its first telling field. */
function titleOf(item: unknown): string {
  if (typeof item === "string") return item;
  if (!isPlain(item)) return "";
  for (const key of ["name", "title", "role", "label", "group", "quote", "slug", "value"]) {
    const value = item[key];
    if (typeof value === "string" && value.trim()) return value.length > 70 ? `${value.slice(0, 70)}…` : value;
  }
  return "";
}

function List({ path, model, en, ar, content, write, reshape, depth }: NodeProps) {
  const enList = Array.isArray(en) ? en : [];
  const arList = Array.isArray(ar) ? ar : [];
  const count = Math.max(enList.length, arList.length);
  const template = itemTemplate(path.join("."), model as unknown[]);
  const key = keyOf(path);
  const locked = key === "projects" || key === "items" && path[0] === "cases";

  const controls = (index: number) => (
    <span className="sp__item-actions">
      <button type="button" className="icon-btn press" aria-label="Move up" disabled={index === 0} onClick={() => reshape(path, (list) => move(list, index, index - 1))}>
        ↑
      </button>
      <button type="button" className="icon-btn press" aria-label="Move down" disabled={index === count - 1} onClick={() => reshape(path, (list) => move(list, index, index + 1))}>
        ↓
      </button>
      {locked ? null : (
        <button
          type="button"
          className="icon-btn press sp__remove"
          aria-label="Remove"
          onClick={() => {
            if (window.confirm("Remove this item in both languages?")) reshape(path, (list) => list.filter((_, i) => i !== index));
          }}
        >
          ×
        </button>
      )}
    </span>
  );

  const add = locked ? null : (
    <button type="button" className="btn btn--xs btn--soft press sp__add" onClick={() => reshape(path, (list) => [...list, structuredClone(template)])}>
      + Add {typeof template === "string" ? "line" : "item"}
    </button>
  );

  // A list of plain lines: one row per line, both languages side by side.
  if (typeof template === "string") {
    const shared = isShared(path);
    return (
      <fieldset className="sp__set">
        <legend>{humanize(key)}</legend>
        <div className="sp__lines">
          {Array.from({ length: count }, (_, index) => (
            <div key={index} className="sp__line">
              {shared ? (
                <input className="input" dir="ltr" value={String(enList[index] ?? "")} onChange={(event) => write("both", [...path, index], event.target.value)} />
              ) : (
                <div className="sp__pair">
                  <input className="input" lang="en" value={String(enList[index] ?? "")} onChange={(event) => write("en", [...path, index], event.target.value)} />
                  <input className="input" dir="rtl" lang="ar" value={String(arList[index] ?? "")} onChange={(event) => write("ar", [...path, index], event.target.value)} />
                </div>
              )}
              {controls(index)}
            </div>
          ))}
          {add}
        </div>
      </fieldset>
    );
  }

  // A list of records: one card per item, folded to its title.
  return (
    <fieldset className="sp__set">
      <legend>
        {humanize(key)} <span className="muted small">· {count}</span>
      </legend>
      <div className="sp__items">
        {count === 0 ? <p className="muted small">Nothing yet.</p> : null}
        {Array.from({ length: count }, (_, index) => (
          <details key={index} className="sp__item">
            <summary>
              <span className="sp__item-title">
                <span className="num muted">{index + 1}.</span> {titleOf(enList[index]) || titleOf(arList[index]) || "New item"}
              </span>
              {controls(index)}
            </summary>
            <Node
              path={[...path, index]}
              model={(model as unknown[])[index] ?? template}
              en={enList[index]}
              ar={arList[index]}
              content={content}
              write={write}
              reshape={reshape}
              depth={depth + 1}
            />
          </details>
        ))}
        {add}
      </div>
    </fieldset>
  );
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const copy = list.slice();
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

/* ------------------------------------------------------------------ *
 *  Basics: who, where, and how the page is put together
 * ------------------------------------------------------------------ */

const SECTION_LABELS: Record<string, string> = {
  work: "Work",
  testimonials: "Testimonials",
  services: "Services",
  pricing: "Pricing",
  process: "Process",
  about: "About",
  contact: "Contact",
};

function Basics({
  content,
  setContent,
  products,
  onResetAll,
}: {
  content: SiteContent;
  setContent: (update: (c: SiteContent | null) => SiteContent | null) => void;
  products: number;
  onResetAll: () => void;
}) {
  const { settings } = content;
  const patch = <K extends "profile" | "links" | "settings">(part: K, value: Partial<SiteContent[K]>) =>
    setContent((c) => (c ? { ...c, [part]: { ...c[part], ...value } } : c));

  const text = (part: "profile" | "links", key: string, label: string, hint?: string, dir: "ltr" | "rtl" = "ltr") => (
    <Field label={label} hint={hint}>
      <input
        className="input"
        dir={dir}
        value={(content[part] as unknown as Record<string, string>)[key] ?? ""}
        onChange={(event) => patch(part, { [key]: event.target.value } as never)}
      />
    </Field>
  );

  const sections = settings.sections;
  const moveSection = (from: number, to: number) => patch("settings", { sections: move(sections, from, to) });

  const order = useMemo(() => new Map(SECTION_KEYS.map((k, i) => [k, i])), []);

  return (
    <div className="sp__basics">
      <fieldset className="sp__set">
        <legend>You</legend>
        <div className="sp__grid">
          {text("profile", "name", "Name")}
          {text("profile", "nameAr", "Name in Arabic", undefined, "rtl")}
          {text("profile", "fullName", "Full name (CV)")}
          {text("profile", "fullNameAr", "Full name in Arabic (CV)", undefined, "rtl")}
          {text("profile", "email", "Email")}
          {text("profile", "whatsapp", "WhatsApp number", "As people should read it; the link keeps the digits.")}
          {text("profile", "telegram", "Telegram username", "Without the @.")}
          {text("profile", "instagram", "Instagram username", "Without the @. Empty hides it.")}
          {text("profile", "github", "GitHub username")}
          {text("profile", "linkedin", "LinkedIn link")}
          {text("profile", "timeZone", "Time zone", "For the clock in the footer, e.g. Asia/Damascus.")}
        </div>
      </fieldset>

      <fieldset className="sp__set">
        <legend>GH Store links</legend>
        <div className="sp__grid">
          {text("links", "store", "Store website")}
          {text("links", "storeBot", "Store bot", "Shown in the hero as “Try my store bot”.")}
          {text("links", "storeChannel", "Store channel", "Empty hides the button.")}
          {text("links", "storeSource", "Source code", "Empty hides the button.")}
        </div>
        <p className="hint">GH Store has {products ? `${products} products` : "an unknown number of products"} on sale as of the last deploy.</p>
      </fieldset>

      <fieldset className="sp__set">
        <legend>Availability and the hero</legend>
        <div className="sp__grid">
          <Field label="Availability" hint="Colours the badge above the title; its words are under Hero → Status.">
            <select className="select" value={settings.availability} onChange={(event) => patch("settings", { availability: event.target.value as never })}>
              {AVAILABILITY.map((value) => (
                <option key={value} value={value}>
                  {value === "open" ? "Open (green)" : value === "limited" ? "Limited (amber)" : "Booked (red)"}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Second hero button" hint="Where “Message me…” goes. Its words are under Hero → Secondary.">
            <select className="select" value={settings.heroChannel} onChange={(event) => patch("settings", { heroChannel: event.target.value as never })}>
              {HERO_CHANNELS.map((value) => (
                <option key={value} value={value}>
                  {value === "telegram" ? "Telegram chat" : value === "whatsapp" ? "WhatsApp chat" : "The contact form"}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="sp__set">
        <legend>Sections</legend>
        <p className="hint sp__note">The order of the page after the hero. Hidden sections leave the page and the menu.</p>
        <ol className="sp__sections">
          {sections.map((section, index) => (
            <li key={section.id} className="sp__line">
              <label className="ivp__check">
                <input
                  type="checkbox"
                  checked={section.visible}
                  onChange={(event) =>
                    patch("settings", { sections: sections.map((s) => (s.id === section.id ? { ...s, visible: event.target.checked } : s)) })
                  }
                />
                {SECTION_LABELS[section.id] ?? section.id}
              </label>
              <span className="sp__item-actions">
                <button type="button" className="icon-btn press" aria-label="Move up" disabled={index === 0} onClick={() => moveSection(index, index - 1)}>
                  ↑
                </button>
                <button
                  type="button"
                  className="icon-btn press"
                  aria-label="Move down"
                  disabled={index === sections.length - 1}
                  onClick={() => moveSection(index, index + 1)}
                >
                  ↓
                </button>
              </span>
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="btn btn--xs btn--ghost press"
          onClick={() => patch("settings", { sections: sections.slice().sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)) })}
        >
          Default order
        </button>
      </fieldset>

      <fieldset className="sp__set">
        <legend>Extras</legend>
        <Field label="Tools strip under the hero" hint="Comma-separated. Empty hides the strip.">
          <textarea
            className="textarea sp__text"
            rows={3}
            dir="ltr"
            value={settings.stack.join(", ")}
            onChange={(event) => patch("settings", { stack: event.target.value.split(",").map((s) => s.trimStart()) })}
          />
        </Field>
        <label className="ivp__check sp__toggle">
          <input type="checkbox" checked={settings.looks} onChange={(event) => patch("settings", { looks: event.target.checked })} />
          Show GH Store&apos;s look picker in the footer
        </label>
        <Field label="Cloudflare Web Analytics token" hint="Optional, on top of Admin → Stats. From Cloudflare → Web Analytics → your site → the 32-character token.">
          <input className="input" dir="ltr" value={settings.beacon} onChange={(event) => patch("settings", { beacon: event.target.value.trim() })} />
        </Field>
      </fieldset>

      <fieldset className="sp__set sp__danger">
        <legend>Start over</legend>
        <p className="hint">Deletes every saved edit and goes back to the words built into the code.</p>
        <button type="button" className="btn btn--xs btn--danger-soft press" onClick={onResetAll}>
          Reset the whole site to defaults
        </button>
      </fieldset>

      <p className="hint">Case study pages: {CASE_SLUGS.map((slug) => `/en/work/${slug}`).join(" · ")}</p>
    </div>
  );
}
