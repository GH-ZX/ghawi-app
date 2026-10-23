"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CvFiles } from "@/components/admin/cv-files";
import { ExternalIcon, PrintIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import type { Dictionary, Locale, Profile, SiteContent } from "@/lib/content";
import { CvSheet } from "./cv-sheet";

/*
 * cv.ghawi.app/edit — the CV builder. The form on one side, the CV exactly as
 * it prints on the other, in English or Arabic. Saving writes the same
 * content document as Admin → Site (D1), so cv.ghawi.app follows within
 * 30 seconds. "Print / PDF" prints the preview; upload that PDF under PDF so
 * "Download PDF" serves it.
 */

type Cv = Dictionary["cv"];
type Status = "loading" | "idle" | "saving" | "saved" | "error";

type FieldSpec = { key: string; label: string; kind?: "text" | "area" | "lines"; hint?: string; ltr?: boolean };

const LISTS: { key: "experience" | "projects" | "skills" | "languages" | "education" | "training"; title: string; fields: FieldSpec[] }[] = [
  {
    key: "experience",
    title: "Experience",
    fields: [
      { key: "role", label: "Role" },
      { key: "org", label: "Organisation", hint: "Leave empty to keep it private." },
      { key: "place", label: "Place" },
      { key: "period", label: "Dates", hint: "e.g. 2026 – Present" },
      { key: "points", label: "What you did", kind: "lines", hint: "One line per bullet. Start with a verb; add numbers where you can." },
    ],
  },
  {
    key: "projects",
    title: "Projects",
    fields: [
      { key: "name", label: "Name" },
      { key: "url", label: "Link", ltr: true },
      { key: "period", label: "Year" },
      { key: "body", label: "What it is", kind: "area" },
    ],
  },
  {
    key: "skills",
    title: "Skills",
    fields: [
      { key: "group", label: "Group" },
      { key: "items", label: "Skills", kind: "area", hint: "Comma-separated." },
    ],
  },
  {
    key: "education",
    title: "Education",
    fields: [
      { key: "title", label: "Degree or field" },
      { key: "place", label: "School" },
      { key: "period", label: "Dates" },
    ],
  },
  {
    key: "training",
    title: "Training & certificates",
    fields: [
      { key: "title", label: "Course" },
      { key: "place", label: "Where / project" },
      { key: "period", label: "Year" },
    ],
  },
  {
    key: "languages",
    title: "Languages",
    fields: [
      { key: "name", label: "Language" },
      { key: "level", label: "Level" },
    ],
  },
];

const LABELS: { key: keyof Cv["labels"]; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "experience", label: "Experience" },
  { key: "projects", label: "Projects" },
  { key: "skills", label: "Skills" },
  { key: "education", label: "Education" },
  { key: "training", label: "Training" },
  { key: "languages", label: "Languages" },
  { key: "download", label: "“Download PDF” button" },
  { key: "print", label: "“Print” button" },
  { key: "other", label: "Other-language button" },
  { key: "back", label: "Link back to the site" },
];

/** The public CV: "/" and "/ar" on cv.ghawi.app, /resume/… while developing. Client-only (after load). */
const liveHref = (lang: Locale) =>
  window.location.host.startsWith("cv.") ? (lang === "ar" ? "/ar" : "/") : `/resume/${lang}`;

/** An empty entry shaped like the list's first one. */
function blankOf(model: Record<string, unknown> | undefined, fields: FieldSpec[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of fields) out[field.key] = field.kind === "lines" ? [""] : "";
  return { ...Object.fromEntries(Object.keys(model ?? {}).map((k) => [k, Array.isArray(model?.[k]) ? [] : ""])), ...out };
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {hint ? <span className="hint">{hint}</span> : null}
    </label>
  );
}

export function CvBuilder() {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [saved, setSaved] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [lang, setLang] = useState<Locale>("en");
  const [view, setView] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch("/api/admin/site/content", { signal: controller.signal, cache: "no-store" });
        if (response.status === 401) return router.refresh();
        if (!response.ok) throw new Error(String(response.status));
        const body = (await response.json()) as { content: SiteContent; updatedAt: string | null };
        setContent(body.content);
        setSaved(JSON.stringify(body.content));
        setUpdatedAt(body.updatedAt);
        setStatus("idle");
      } catch {
        if (!controller.signal.aborted) setStatus("error");
      }
    })();
    return () => controller.abort();
  }, [router]);

  const dirty = content !== null && JSON.stringify(content) !== saved;

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

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  if (!content) {
    return (
      <div className="cvb cvb--loading">
        {status === "error" ? <p className="login__alert">Couldn&apos;t load your CV. Refresh to try again.</p> : <span className="spinner" aria-hidden="true" />}
      </div>
    );
  }

  const cv = content[lang].cv;
  const profile = content.profile;
  const setCv = (patch: Partial<Cv>) => setContent((c) => (c ? { ...c, [lang]: { ...c[lang], cv: { ...c[lang].cv, ...patch } } } : c));
  const setProfile = (patch: Partial<Profile>) => setContent((c) => (c ? { ...c, profile: { ...c.profile, ...patch } } : c));
  const setLocation = (location: string) =>
    setContent((c) => (c ? { ...c, [lang]: { ...c[lang], person: { ...c[lang].person, location } } } : c));
  const rtl = lang === "ar";
  const dir = rtl ? "rtl" : "ltr";
  const nameKey = rtl ? "fullNameAr" : "fullName";

  return (
    <div className="cvb" data-view={view}>
      <header className="cvb__bar">
        <span className="cvb__brand">
          <Logo height={18} />
          CV builder
        </span>
        <div className="seg" role="group" aria-label="Language">
          <button type="button" className="press" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
            English
          </button>
          <button type="button" className="press" aria-pressed={lang === "ar"} onClick={() => setLang("ar")}>
            العربية
          </button>
        </div>
        <div className="seg cvb__views" role="group" aria-label="Show">
          <button type="button" className="press" aria-pressed={view === "edit"} onClick={() => setView("edit")}>
            Edit
          </button>
          <button type="button" className="press" aria-pressed={view === "preview"} onClick={() => setView("preview")}>
            Preview
          </button>
        </div>
        <span className="cvb__actions">
          <span className="muted small" role="status">
            {status === "saving" ? "Saving…" : status === "error" ? "Couldn't save" : dirty ? "Unsaved changes" : status === "saved" ? "Saved · live in 30 s" : "All saved"}
          </span>
          <button type="button" className="btn btn--xs btn--ghost press" disabled={!dirty} onClick={() => setContent(JSON.parse(saved) as SiteContent)}>
            Discard
          </button>
          <button type="button" className="btn btn--xs press" disabled={!dirty || status === "saving"} onClick={save}>
            Save
          </button>
          <button type="button" className="btn btn--xs btn--soft press" onClick={() => window.print()}>
            <PrintIcon size={15} />
            Print / PDF
          </button>
          <a className="btn btn--xs btn--ghost press" href={liveHref(lang)} target="_blank" rel="noopener noreferrer">
            View <ExternalIcon size={13} />
          </a>
          <button type="button" className="btn btn--xs btn--ghost press" onClick={signOut}>
            Sign out
          </button>
        </span>
      </header>

      <div className="cvb__main">
        <div className="cvb__editor">
          <p className="cvb__note muted small">
            Editing the {rtl ? "Arabic" : "English"} CV. Contact details are shared by both languages and by the site.
          </p>

          <fieldset className="sp__set">
            <legend>You</legend>
            <div className="sp__fields">
              <Field label="Full name">
                <input className="input" dir={dir} value={profile[nameKey]} onChange={(e) => setProfile({ [nameKey]: e.target.value })} />
              </Field>
              <Field label="Headline" hint="Your title and focus, in one line.">
                <input className="input" dir={dir} value={cv.headline} onChange={(e) => setCv({ headline: e.target.value })} />
              </Field>
              <Field label="Location" hint="Also shown on the site.">
                <input className="input" dir={dir} value={content[lang].person.location} onChange={(e) => setLocation(e.target.value)} />
              </Field>
              <label className="ivp__check">
                <input type="checkbox" checked={cv.photo} onChange={(e) => setCv({ photo: e.target.checked })} />
                Show my photo
              </label>
              <div className="sp__grid">
                <Field label="Email">
                  <input className="input" dir="ltr" value={profile.email} onChange={(e) => setProfile({ email: e.target.value })} />
                </Field>
                <Field label="Phone / WhatsApp">
                  <input className="input" dir="ltr" value={profile.whatsapp} onChange={(e) => setProfile({ whatsapp: e.target.value })} />
                </Field>
                <Field label="Telegram username">
                  <input className="input" dir="ltr" value={profile.telegram} onChange={(e) => setProfile({ telegram: e.target.value })} />
                </Field>
                <Field label="GitHub username">
                  <input className="input" dir="ltr" value={profile.github} onChange={(e) => setProfile({ github: e.target.value })} />
                </Field>
                <Field label="LinkedIn link">
                  <input className="input" dir="ltr" value={profile.linkedin} onChange={(e) => setProfile({ linkedin: e.target.value })} />
                </Field>
              </div>
            </div>
          </fieldset>

          <fieldset className="sp__set">
            <legend>Profile</legend>
            <Field label="Summary" hint="Three or four lines: who you are, what you've shipped, what you want next.">
              <textarea className="textarea" dir={dir} rows={6} value={cv.summary} onChange={(e) => setCv({ summary: e.target.value })} />
            </Field>
          </fieldset>

          {LISTS.map((list) => (
            <ListEditor
              key={list.key}
              title={list.title}
              fields={list.fields}
              items={cv[list.key] as unknown as Record<string, unknown>[]}
              dir={dir}
              onChange={(items) => setCv({ [list.key]: items } as Partial<Cv>)}
            />
          ))}

          <details className="sp__set cvb__more">
            <summary>Headings, buttons and search</summary>
            <div className="sp__grid">
              {LABELS.map((item) => (
                <Field key={item.key} label={item.label}>
                  <input
                    className="input"
                    dir={dir}
                    value={cv.labels[item.key]}
                    onChange={(e) => setCv({ labels: { ...cv.labels, [item.key]: e.target.value } })}
                  />
                </Field>
              ))}
            </div>
            <Field label="Page title (search results)">
              <input className="input" dir={dir} value={cv.title} onChange={(e) => setCv({ title: e.target.value })} />
            </Field>
            <Field label="Page description (search results)">
              <textarea className="textarea" dir={dir} rows={3} value={cv.description} onChange={(e) => setCv({ description: e.target.value })} />
            </Field>
          </details>

          <CvFiles contentUpdatedAt={updatedAt} />
        </div>

        <div className="cvb__preview">
          <CvSheet cv={cv} profile={profile} locale={lang} location={content[lang].person.location} />
        </div>
      </div>
    </div>
  );
}

function ListEditor({
  title,
  fields,
  items,
  dir,
  onChange,
}: {
  title: string;
  fields: FieldSpec[];
  items: Record<string, unknown>[];
  dir: "ltr" | "rtl";
  onChange: (items: Record<string, unknown>[]) => void;
}) {
  const update = (index: number, key: string, value: unknown) => onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const copy = items.slice();
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    onChange(copy);
  };

  return (
    <fieldset className="sp__set">
      <legend>
        {title} <span className="muted small">· {items.length}</span>
      </legend>
      <div className="sp__items">
        {items.map((item, index) => (
          <details key={index} className="sp__item" open={!String(item[fields[0].key] ?? "").trim() || undefined}>
            <summary>
              <span className="sp__item-title">{String(item[fields[0].key] ?? "") || "New entry"}</span>
              <span className="sp__item-actions">
                <button type="button" className="icon-btn press" aria-label="Move up" disabled={index === 0} onClick={() => move(index, index - 1)}>
                  ↑
                </button>
                <button type="button" className="icon-btn press" aria-label="Move down" disabled={index === items.length - 1} onClick={() => move(index, index + 1)}>
                  ↓
                </button>
                <button
                  type="button"
                  className="icon-btn press sp__remove"
                  aria-label="Remove"
                  onClick={() => {
                    if (window.confirm("Remove this entry?")) onChange(items.filter((_, i) => i !== index));
                  }}
                >
                  ×
                </button>
              </span>
            </summary>
            <div className="sp__fields">
              {fields.map((field) => {
                const value = item[field.key];
                const fieldDir = field.ltr ? "ltr" : dir;
                return (
                  <Field key={field.key} label={field.label} hint={field.hint}>
                    {field.kind === "lines" ? (
                      <textarea
                        className="textarea"
                        dir={fieldDir}
                        rows={Math.max(3, (Array.isArray(value) ? value.length : 1) + 1)}
                        value={Array.isArray(value) ? value.join("\n") : ""}
                        onChange={(e) => update(index, field.key, e.target.value.split("\n"))}
                      />
                    ) : field.kind === "area" ? (
                      <textarea className="textarea" dir={fieldDir} rows={3} value={String(value ?? "")} onChange={(e) => update(index, field.key, e.target.value)} />
                    ) : (
                      <input className="input" dir={fieldDir} value={String(value ?? "")} onChange={(e) => update(index, field.key, e.target.value)} />
                    )}
                  </Field>
                );
              })}
            </div>
          </details>
        ))}
        <button type="button" className="btn btn--xs btn--soft press sp__add" onClick={() => onChange([...items, blankOf(items[0], fields)])}>
          + Add
        </button>
      </div>
    </fieldset>
  );
}
