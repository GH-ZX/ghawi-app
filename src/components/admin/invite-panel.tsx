"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Monogram } from "@/components/invite/monogram";
import { PhotosPanel } from "./invite-photos";
import { QrDialog } from "./qr-card";
import {
  addressee,
  arabicDigits,
  INVITE_HOST,
  INVITE_THEMES,
  INVITE_URL,
  PARTY_KEYS,
  RULE_ICONS,
  FONT_LABELS,
  INVITE_FONTS,
  INVITE_METALS,
  METAL_LABELS,
  metalColor,
  INVITE_STATUSES,
  THEME_LABELS,
  THEME_SWATCHES,
  type InviteConfig,
  type InviteEvent,
  type InviteTheme,
  type Parties,
  type PartyKey,
  type RuleIcon,
} from "@/lib/invite";

/*
 * Admin → Invitation. Everything on invite.ghawi.app is edited here and
 * saved to D1: the guests and their personal links, and the invitation
 * itself (names, wording, both parties, theme, logo). Arabic, right to left.
 */

type GuestRow = {
  id: number;
  slug: string;
  name: string;
  honorific: string;
  parties: Parties;
  seats: number;
  theme: InviteTheme | null;
  note: string;
  created_at: string;
  first_open: string | null;
  last_open: string | null;
  open_count: number;
  rsvp_id: number | null;
  attending: number | null;
  men: number | null;
  women: number | null;
  message: string | null;
  replied_at: string | null;
};

type GeneralRow = { id: number; name: string; attending: number; men: number; women: number; message: string; created_at: string };

/** `suffix` is set for a new guest only: the random tail of their link. */
type Draft = { id?: number; suffix?: string; slug: string; name: string; honorific: string; parties: Parties; seats: number; theme: InviteTheme | ""; note: string };

const EMPTY_DRAFT: Draft = { slug: "", name: "", honorific: "", parties: "both", seats: 2, theme: "", note: "" };

const HONORIFICS = ["السيد", "السيدة", "الآنسة", "الأستاذ", "الأستاذة", "الحاج", "الحاجة", "الدكتور", "الدكتورة", "عائلة", "آل"];

const STATUS_LABEL = { auto: "تلقائي", live: "مفعّلة دائماً", ended: "منتهية" } as const;

const PARTY_LABEL: Record<Parties, string> = { men: "حفل الرجال", women: "حفل النساء", both: "الحفلتان" };

const RULE_ICON_LABEL: Record<RuleIcon, string> = {
  child: "بدون أطفال",
  smoke: "بدون أراكيل",
  heart: "قلب",
  clock: "ساعة",
  camera: "كاميرا",
  gift: "هدية",
};

const ERRORS: Record<string, string> = {
  bad_slug: "الرابط: أحرف لاتينية صغيرة وأرقام وشرطة فقط، مثل haifa أو abu-omar.",
  slug_taken: "هذا الرابط مستخدم لمدعو آخر.",
  need_name: "اكتب اسم المدعو.",
  bad_seats: "عدد المقاعد بين ١ و٣٠.",
  too_large: "الصورة أكبر من ٦٠٠ كيلوبايت.",
  bad_image: "الصيغ المقبولة: PNG أو JPG أو WEBP أو SVG.",
};

const when = new Intl.DateTimeFormat("ar-SY", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const formatWhen = (iso: string | null) => (iso ? when.format(new Date(iso)) : "");

/** A Latin link from an Arabic name: a starting point the admin can edit. */
const LATIN: Record<string, string> = {
  ا: "a", أ: "a", إ: "i", آ: "a", ب: "b", ت: "t", ث: "th", ج: "j", ح: "h", خ: "kh", د: "d", ذ: "th", ر: "r",
  ز: "z", س: "s", ش: "sh", ص: "s", ض: "d", ط: "t", ظ: "z", ع: "a", غ: "gh", ف: "f", ق: "q", ك: "k", ل: "l",
  م: "m", ن: "n", ه: "h", ة: "a", و: "o", ي: "i", ى: "a", ء: "", ؤ: "o", ئ: "e", " ": "-",
};
function suggestSlug(name: string): string {
  const latin = Array.from(name.trim().toLowerCase())
    .map((ch) => (/[a-z0-9-]/.test(ch) ? ch : (LATIN[ch] ?? "")))
    .join("");
  return latin.replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, SLUG_BASE_MAX);
}

/*
 * A new guest's link is the readable part plus a random tail —
 * invite.ghawi.app/haifa-k7m2qx9wbe — so nobody can reach a guest's invitation
 * (or the photos meant for their party) by guessing a name. Ten characters
 * from 32 unambiguous ones (no 0/o, 1/l): 50 bits, about 10^15 links per
 * name — far beyond online guessing — and 256 divides evenly by 32, so
 * every character is equally likely.
 */
const SUFFIX_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";
const SUFFIX_LENGTH = 10;
const SLUG_BASE_MAX = 40 - SUFFIX_LENGTH - 1;

function randomSuffix(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(SUFFIX_LENGTH));
  return Array.from(bytes, (b) => SUFFIX_ALPHABET[b % SUFFIX_ALPHABET.length]).join("");
}

function shareText(template: string, to: string, link: string) {
  return template.replace(/\{name\}/g, to).replace(/\{link\}/g, link);
}

export function InvitePanel() {
  const router = useRouter();
  const [view, setView] = useState<"guests" | "photos" | "settings">("guests");
  const [config, setConfig] = useState<InviteConfig | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [guests, setGuests] = useState<GuestRow[] | null>(null);
  const [general, setGeneral] = useState<GeneralRow[]>([]);
  const [loadError, setLoadError] = useState("");
  const [version, setVersion] = useState(0);
  const reload = () => setVersion((v) => v + 1);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const [c, g] = await Promise.all([
          fetch("/api/admin/invite/config", { signal: controller.signal, cache: "no-store" }),
          fetch("/api/admin/invite/guests", { signal: controller.signal, cache: "no-store" }),
        ]);
        if (c.status === 401 || g.status === 401) return router.refresh();
        if (!c.ok || !g.ok) throw new Error("load");
        const cb = (await c.json()) as { config: InviteConfig; logo: string | null };
        const gb = (await g.json()) as { guests: GuestRow[]; general: GeneralRow[] };
        setConfig((current) => current ?? cb.config);
        setLogo(cb.logo);
        setGuests(gb.guests);
        setGeneral(gb.general);
        setLoadError("");
      } catch {
        if (!controller.signal.aborted) setLoadError("تعذّر تحميل بيانات الدعوة. هل طُبّقت migration 0004 على قاعدة البيانات؟");
      }
    })();
    return () => controller.abort();
  }, [router, version]);

  return (
    <section className="ivp" dir="rtl" lang="ar">
      <div className="ivp__head">
        <div>
          <h2>دعوة الزفاف</h2>
          <p className="muted">
            {INVITE_HOST} · كل التعديلات تُحفظ في قاعدة البيانات وتظهر فوراً
          </p>
        </div>
        <div className="seg" role="group" aria-label="القسم">
          <button type="button" className="press" aria-pressed={view === "guests"} onClick={() => setView("guests")}>
            المدعوون
          </button>
          <button type="button" className="press" aria-pressed={view === "photos"} onClick={() => setView("photos")}>
            الصور
          </button>
          <button type="button" className="press" aria-pressed={view === "settings"} onClick={() => setView("settings")}>
            الإعدادات
          </button>
        </div>
      </div>

      {loadError ? (
        <p className="login__alert" role="alert">
          {loadError}
        </p>
      ) : null}

      {!config || !guests ? (
        loadError ? null : (
          <div className="empty">
            <span className="spinner" aria-hidden="true" />
            جارٍ التحميل…
          </div>
        )
      ) : view === "guests" ? (
        <GuestsView config={config} guests={guests} general={general} reload={reload} />
      ) : view === "photos" ? (
        <PhotosPanel config={config} />
      ) : (
        <SettingsView config={config} setConfig={setConfig} logo={logo} setLogo={setLogo} />
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 *  Guests
 * ------------------------------------------------------------------ */

function GuestsView({ config, guests, general, reload }: { config: InviteConfig; guests: GuestRow[]; general: GeneralRow[]; reload: () => void }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [query, setQuery] = useState("");

  const stats = useMemo(() => {
    const replies = [
      ...guests.filter((g) => g.rsvp_id).map((g) => ({ attending: g.attending === 1, men: g.men ?? 0, women: g.women ?? 0 })),
      ...general.map((r) => ({ attending: r.attending === 1, men: r.men, women: r.women })),
    ];
    return {
      invites: guests.length,
      opened: guests.filter((g) => g.open_count > 0).length,
      men: replies.filter((r) => r.attending && r.men > 0).length,
      women: replies.filter((r) => r.attending && r.women > 0).length,
      declined: replies.filter((r) => !r.attending).length,
      waiting: guests.filter((g) => !g.rsvp_id).length,
    };
  }, [guests, general]);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return guests;
    return guests.filter((g) => [g.name, g.honorific, g.slug, g.note].some((f) => f.toLowerCase().includes(needle)));
  }, [guests, query]);

  async function remove(guest: GuestRow) {
    if (!window.confirm(`حذف دعوة ${addressee(guest)} وردّها نهائياً؟`)) return;
    await fetch(`/api/admin/invite/guests?id=${guest.id}`, { method: "DELETE" });
    reload();
  }

  async function removeReply(id: number, who: string) {
    if (!window.confirm(`حذف ردّ ${who}؟`)) return;
    await fetch(`/api/admin/invite/rsvps?id=${id}`, { method: "DELETE" });
    reload();
  }

  return (
    <>
      <dl className="kpis ivp__kpis">
        <div className="kpi">
          <dt>الدعوات</dt>
          <dd className="num">{arabicDigits(stats.invites)}</dd>
        </div>
        <div className="kpi">
          <dt>فُتحت</dt>
          <dd className="num">{arabicDigits(stats.opened)}</dd>
        </div>
        <div className="kpi">
          <dt>ردود حضور · رجال</dt>
          <dd className="num">{arabicDigits(stats.men)}</dd>
        </div>
        <div className="kpi">
          <dt>ردود حضور · نساء</dt>
          <dd className="num">{arabicDigits(stats.women)}</dd>
        </div>
        <div className="kpi">
          <dt>اعتذروا</dt>
          <dd className="num">{arabicDigits(stats.declined)}</dd>
        </div>
        <div className="kpi">
          <dt>لم يردّوا بعد</dt>
          <dd className="num">{arabicDigits(stats.waiting)}</dd>
        </div>
      </dl>

      <div className="card card--pad ivp__general">
        <div className="ivp__general-text">
          <strong>الرابط العام</strong>
          <span className="muted small">بدون اسم، ويعرض الحفلتين. يكتب الزائر اسمه عند تأكيد الحضور.</span>
        </div>
        <LinkTools slug="" to="" config={config} theme={config.theme} />
      </div>

      {draft ? (
        <GuestEditor draft={draft} config={config} onClose={() => setDraft(null)} onSaved={() => (setDraft(null), reload())} />
      ) : (
        <div className="toolbar">
          <button type="button" className="btn btn--sm press" onClick={() => setDraft({ ...EMPTY_DRAFT, suffix: randomSuffix() })}>
            + دعوة جديدة باسم شخص
          </button>
          <label className="search">
            <span className="sr-only">بحث</span>
            <input type="search" placeholder="ابحث بالاسم أو الرابط" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
        </div>
      )}

      {shown.length === 0 ? (
        <div className="empty">{query ? "لا نتائج لهذا البحث." : "لا دعوات بعد. أضف أول مدعو، مثلاً هيفاء، فيصبح رابطها مثل invite.ghawi.app/haifa-k7m2qx9wbe"}</div>
      ) : (
        <ul className="messages">
          {shown.map((g) => {
            const to = addressee(g);
            return (
              <li key={g.id} className="message ivp__guest">
                <div className="message__top">
                  <span className="message__who">
                    <strong>{to}</strong>
                  </span>
                  <span className="message__when">{g.open_count > 0 ? `فتحها ${arabicDigits(g.open_count)} مرة · ${formatWhen(g.last_open)}` : "لم تُفتح بعد"}</span>
                </div>
                <div className="message__tags">
                  <span className="badge badge--soft">{PARTY_LABEL[g.parties]}</span>
                  {g.theme ? <span className="badge badge--soft">ثيم: {THEME_LABELS[g.theme]}</span> : null}
                  {g.rsvp_id ? (
                    g.attending ? (
                      <span className="badge badge--good">
                        سيحضر
                      </span>
                    ) : (
                      <span className="badge badge--warn">اعتذر</span>
                    )
                  ) : (
                    <span className="badge">لم يردّ</span>
                  )}
                </div>
                {g.message ? <p className="message__text">«{g.message}»</p> : null}
                <LinkTools slug={g.slug} to={to} config={config} theme={g.theme ?? config.theme} />
                <div className="message__actions">
                  <button
                    type="button"
                    className="btn btn--xs btn--soft press"
                    onClick={() =>
                      setDraft({ id: g.id, slug: g.slug, name: g.name, honorific: g.honorific, parties: g.parties, seats: g.seats, theme: g.theme ?? "", note: g.note })
                    }
                  >
                    تعديل
                  </button>
                  {g.rsvp_id ? (
                    <button type="button" className="btn btn--xs btn--soft press" onClick={() => removeReply(g.rsvp_id!, to)}>
                      مسح الرد
                    </button>
                  ) : null}
                  <button type="button" className="btn btn--xs btn--danger-soft press" onClick={() => remove(g)}>
                    حذف
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <h3 className="ivp__subhead">ردود الرابط العام · {arabicDigits(general.length)}</h3>
      {general.length === 0 ? (
        <div className="empty">لا ردود من الرابط العام بعد.</div>
      ) : (
        <ul className="messages">
          {general.map((r) => (
            <li key={r.id} className="message">
              <div className="message__top">
                <span className="message__who">
                  <strong>{r.name}</strong>
                </span>
                <span className="message__when">{formatWhen(r.created_at)}</span>
              </div>
              <div className="message__tags">
                {r.attending ? (
                  <span className="badge badge--good">
                    سيحضر
                  </span>
                ) : (
                  <span className="badge badge--warn">اعتذر</span>
                )}
              </div>
              {r.message ? <p className="message__text">«{r.message}»</p> : null}
              <div className="message__actions">
                <button type="button" className="btn btn--xs btn--danger-soft press" onClick={() => removeReply(r.id, r.name)}>
                  حذف
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/** The link, plus copy, WhatsApp and preview. An empty slug is the general link. */
function LinkTools({ slug, to, config, theme }: { slug: string; to: string; config: InviteConfig; theme: InviteTheme }) {
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState(false);
  const link = slug ? `${INVITE_URL}/${slug}` : `${INVITE_URL}/general`;
  // The general QR points at the bare subdomain: a shorter link, a simpler code.
  const qrLink = slug ? link : INVITE_URL;
  const message = shareText(config.shareMessage, to || "أهلنا وأحبتنا", link);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("انسخ الرابط", link);
    }
  }

  return (
    <div className="copy-box ivp__link">
      <a href={link} target="_blank" rel="noopener noreferrer">
        {link.replace("https://", "")}
      </a>
      <button type="button" className="btn btn--xs btn--soft press" onClick={copy}>
        {copied ? "نُسخ ✓" : "نسخ"}
      </button>
      <a className="btn btn--xs press ivp__wa" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
        واتساب
      </a>
      <a className="btn btn--xs btn--ghost press" href={`/invite/${slug || "general"}?preview=1`} target="_blank" rel="noopener noreferrer">
        معاينة
      </a>
      <button type="button" className="btn btn--xs btn--ghost press" onClick={() => setQr(true)}>
        QR
      </button>
      {qr ? <QrDialog link={qrLink} to={to} theme={theme} config={config} message={message} onClose={() => setQr(false)} /> : null}
    </div>
  );
}

function GuestEditor({ draft, config, onClose, onSaved }: { draft: Draft; config: InviteConfig; onClose: () => void; onSaved: () => void }) {
  const [d, setD] = useState<Draft>(draft);
  const [slugTouched, setSlugTouched] = useState(Boolean(draft.id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setD((current) => ({ ...current, [key]: value }));
  const base = d.slug.replace(/-+$/, "");
  const fullSlug = d.suffix ? `${base}-${d.suffix}` : d.slug;

  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/invite/guests", {
        method: d.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...d, slug: fullSlug, suffix: undefined, theme: d.theme || null }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "failed");
      onSaved();
    } catch (failure) {
      setError(ERRORS[(failure as Error).message] ?? "تعذّر الحفظ، حاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card card--pad ivp__editor" onSubmit={save}>
      <h3>{d.id ? "تعديل الدعوة" : "دعوة جديدة"}</h3>
      <div className="ivp__grid">
        <label className="field">
          <span className="field__label">الاسم</span>
          <input
            className="input"
            value={d.name}
            onChange={(e) => {
              const name = e.target.value;
              setD((current) => ({ ...current, name, slug: slugTouched ? current.slug : suggestSlug(name) }));
            }}
            placeholder="هيفاء"
            required
            maxLength={80}
            autoFocus
          />
        </label>
        <label className="field">
          <span className="field__label">
            اللقب <span className="muted">(اختياري)</span>
          </span>
          <input className="input" list="ivp-honorifics" value={d.honorific} onChange={(e) => set("honorific", e.target.value)} placeholder="الآنسة" maxLength={30} />
          <datalist id="ivp-honorifics">
            {HONORIFICS.map((h) => (
              <option key={h} value={h} />
            ))}
          </datalist>
        </label>
        <label className="field ivp__wide">
          <span className="field__label">الرابط</span>
          <span className="ivp__slug" dir="ltr">
            <span>{INVITE_HOST}/</span>
            <input
              className="input"
              value={d.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
              }}
              placeholder="haifa"
              required
              maxLength={d.suffix ? SLUG_BASE_MAX : 40}
              spellCheck={false}
              autoCapitalize="off"
            />
            {d.suffix ? <span className="ivp__suffix">-{d.suffix}</span> : null}
          </span>
          {d.suffix ? (
            <span className="hint">
              الجزء الأخير «{d.suffix}» عشوائي حتى لا يستطيع أحد تخمين الرابط. الرابط النهائي: <bdi dir="ltr">{INVITE_HOST}/{fullSlug}</bdi>
            </span>
          ) : null}
        </label>
        <div className="field ivp__wide">
          <span className="field__label">الحفلة التي تظهر في الدعوة</span>
          <div className="seg" role="group" aria-label="الحفلة">
            {(["men", "women", "both"] as Parties[]).map((p) => (
              <button key={p} type="button" className="press" aria-pressed={d.parties === p} onClick={() => set("parties", p)}>
                {p === "both" ? "الحفلتان" : p === "men" ? "الرجال" : "النساء"}
              </button>
            ))}
          </div>
        </div>
        <label className="field">
          <span className="field__label">ثيم خاص بهذا المدعو</span>
          <select className="select" value={d.theme} onChange={(e) => set("theme", e.target.value as InviteTheme | "")}>
            <option value="">ثيم الدعوة العام ({THEME_LABELS[config.theme]})</option>
            {INVITE_THEMES.map((t) => (
              <option key={t} value={t}>
                {THEME_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="field ivp__wide">
          <span className="field__label">
            كلمة خاصة <span className="muted">(اختياري، تحل محل الجملة العامة)</span>
          </span>
          <textarea className="textarea" value={d.note} onChange={(e) => set("note", e.target.value)} placeholder={config.personalLine} maxLength={300} rows={2} />
        </label>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      <div className="message__actions">
        <button type="submit" className="btn btn--sm press" disabled={busy}>
          {busy ? "جارٍ الحفظ…" : "حفظ"}
        </button>
        <button type="button" className="btn btn--sm btn--ghost press" onClick={onClose}>
          إلغاء
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ *
 *  Settings
 * ------------------------------------------------------------------ */

function SettingsView({
  config,
  setConfig,
  logo,
  setLogo,
}: {
  config: InviteConfig;
  setConfig: (c: InviteConfig) => void;
  logo: string | null;
  setLogo: (l: string | null) => void;
}) {
  const [c, setC] = useState<InviteConfig>(config);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const dirty = JSON.stringify(c) !== JSON.stringify(config);
  const set = <K extends keyof InviteConfig>(key: K, value: InviteConfig[K]) => setC((current) => ({ ...current, [key]: value }));
  const setEvent = (party: PartyKey, key: keyof InviteEvent, value: string) =>
    setC((current) => ({ ...current, events: { ...current.events, [party]: { ...current.events[party], [key]: value } } }));

  async function save() {
    setStatus("saving");
    try {
      const response = await fetch("/api/admin/invite/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: c }),
      });
      const body = (await response.json()) as { config?: InviteConfig };
      if (!response.ok || !body.config) throw new Error("failed");
      setConfig(body.config);
      setC(body.config);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  const text = (key: keyof InviteConfig, label: string, hint?: string, long = false) => (
    <label className={`field${long ? " ivp__wide" : ""}`}>
      <span className="field__label">{label}</span>
      {long ? (
        <textarea className="textarea ivp__short" value={c[key] as string} onChange={(e) => set(key, e.target.value as never)} rows={2} />
      ) : (
        <input className="input" value={c[key] as string} onChange={(e) => set(key, e.target.value as never)} />
      )}
      {hint ? <span className="hint">{hint}</span> : null}
    </label>
  );

  return (
    <div className="ivp__settings">
      <fieldset className="card card--pad ivp__set">
        <legend>الأسماء</legend>
        <div className="ivp__grid">
          {text("groomName", "اسم العريس الكامل")}
          {text("groomShort", "اسم العريس الظاهر", "في «أحمد ♥ كريمته» وبالخط الكبير")}
          {text("brideDisplay", "كيف تظهر العروس بجانبه", "اسمها لا يظهر؛ مثلاً: كريمته")}
          {text("groomFatherTitle", "لقب والد العريس", "مثل: الأستاذ، الحاج، الدكتور — أو فارغ")}
          <div className="field">
            {text("groomFather", "والد العريس")}
            <label className="ivp__check">
              <input type="checkbox" checked={c.groomFatherDeceased} onChange={(e) => set("groomFatherDeceased", e.target.checked)} /> متوفى
            </label>
          </div>
          {text("brideFatherTitle", "لقب والد العروس", "اختياري")}
          <div className="field">
            {text("brideFather", "والد العروس")}
            <label className="ivp__check">
              <input type="checkbox" checked={c.brideFatherDeceased} onChange={(e) => set("brideFatherDeceased", e.target.checked)} /> متوفى
            </label>
          </div>
          {text("deceasedLabel", "العبارة بعد اسم المتوفى", "تظهر بعد الاسم بخط أصغر، مثل: رحمه الله")}
        </div>
      </fieldset>

      <fieldset className="card card--pad ivp__set">
        <legend>نص الدعوة</legend>
        <div className="ivp__grid">
          {text("opening", "الافتتاحية", undefined, true)}
          {text("invitationLine", "جملة الدعوة", "{groomFather} والد العريس بلقبه · {groom} اسم العريس بخط مميز · {brideFather} والد العروس", true)}
          {text("personalLine", "الكلمة العامة للمدعوين", "لكل مدعو يمكن كتابة كلمة خاصة بدلاً منها", true)}
          {text("closing", "الختام", undefined, true)}
          {text("notesTitle", "عنوان التعليمات", "مثل: ملاحظة")}
          {text("families", "العائلتان")}
          {text("shareMessage", "رسالة واتساب", "{name} اسم المدعو، {link} رابط دعوته", true)}
        </div>
      </fieldset>

      <fieldset className="card card--pad ivp__set">
        <legend>شاشة الترحيب</legend>
        <div className="ivp__grid">
          {text("splashTitle", "العنوان", "يظهر فوق اسم المدعو، مثل: تمّت دعوتك")}
          {text("splashText", "الكلمة", undefined, true)}
          {text("generalTitle", "عنوان الرابط العام", "بدل اسم المدعو، مثل: دعوة خاصة")}
          {text("generalLine", "سطر الرابط العام", "فوق «أحمد ♥ كريمته»، مثل: لحضور حفل زفاف")}
          <span className="hint ivp__wide">تظهر نحو ثلاث ثوانٍ عند فتح الرابط، ثم الظرف. النقر يتخطاها.</span>
        </div>
      </fieldset>

      <fieldset className="card card--pad ivp__set">
        <legend>لمسات إسلامية</legend>
        <div className="ivp__grid">
          <label className="ivp__check ivp__wide">
            <input type="checkbox" checked={c.verseEnabled} onChange={(e) => set("verseEnabled", e.target.checked)} /> الآية في إطار مزخرف أعلى نص الدعوة
          </label>
          {text("verseText", "نص الآية", undefined, true)}
          {text("verseRef", "المرجع")}
          <label className="ivp__check ivp__wide">
            <input type="checkbox" checked={c.blessingEnabled} onChange={(e) => set("blessingEnabled", e.target.checked)} /> النجمة الثمانية مع الخاتمين والدعاء قبل الختام
          </label>
          {text("blessingText", "الدعاء", undefined, true)}
          <label className="ivp__check ivp__wide">
            <input type="checkbox" checked={c.contractEnabled} onChange={(e) => set("contractEnabled", e.target.checked)} /> رمز عقد القران (لفافة بختم وريشة) تحت جملة الدعوة
          </label>
          {text("contractCaption", "العبارة تحت رمز عقد القران")}
          <label className="ivp__check ivp__wide">
            <input type="checkbox" checked={c.coupleArtEnabled} onChange={(e) => set("coupleArtEnabled", e.target.checked)} /> رسم العروسين (ظل أسود بسيط) فوق تأكيد الحضور
          </label>
        </div>
      </fieldset>

      <fieldset className="card card--pad ivp__set">
        <legend>التواصل</legend>
        <div className="ivp__grid">
          <label className="ivp__check ivp__wide">
            <input type="checkbox" checked={c.contactEnabled} onChange={(e) => set("contactEnabled", e.target.checked)} /> إظهار قسم التواصل
          </label>
          {text("contactTitle", "العنوان")}
          {text("contactText", "الكلمة", undefined, true)}
          <div className="ivp__wide ivp__contacts">
            {c.contacts.map((person, i) => (
              <div key={i} className="ivp__contact">
                <input
                  className="input"
                  value={person.name}
                  onChange={(e) => set("contacts", c.contacts.map((p, j) => (j === i ? { ...p, name: e.target.value } : p)))}
                  placeholder="الاسم"
                  aria-label="الاسم"
                />
                <input
                  className="input"
                  dir="ltr"
                  type="tel"
                  value={person.phone}
                  onChange={(e) => set("contacts", c.contacts.map((p, j) => (j === i ? { ...p, phone: e.target.value } : p)))}
                  placeholder="+963…"
                  aria-label="رقم واتساب"
                />
                <button type="button" className="btn btn--xs btn--danger-soft press" onClick={() => set("contacts", c.contacts.filter((_, j) => j !== i))}>
                  حذف
                </button>
              </div>
            ))}
            {c.contacts.length < 4 ? (
              <button type="button" className="btn btn--xs btn--soft press" onClick={() => set("contacts", [...c.contacts, { name: "", phone: "" }])}>
                + إضافة شخص
              </button>
            ) : null}
            <span className="hint">الرقم مع رمز الدولة، مثل ‎+963992350038‎. يفتح زر «واتساب» محادثة مع الرقم مباشرة.</span>
          </div>
        </div>
      </fieldset>

      <fieldset className="card card--pad ivp__set">
        <legend>الموعد</legend>
        <div className="ivp__grid">
          <label className="field">
            <span className="field__label">التاريخ والساعة (للحفلتين معاً، بتوقيت المكان)</span>
            <input className="input" type="datetime-local" value={c.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
          </label>
          <label className="field">
            <span className="field__label">فرق توقيت المكان عن UTC</span>
            <select className="select" value={c.utcOffset} onChange={(e) => set("utcOffset", e.target.value)}>
              {["+02:00", "+03:00", "+04:00", "+01:00", "+00:00"].map((o) => (
                <option key={o} value={o}>
                  {o}
                  {o === "+03:00" ? " (سوريا)" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>

      {PARTY_KEYS.map((party) => (
        <fieldset key={party} className="card card--pad ivp__set">
          <legend>{c.events[party].title || PARTY_LABEL[party]}</legend>
          <div className="ivp__grid">
            <label className="field">
              <span className="field__label">العنوان</span>
              <input className="input" value={c.events[party].title} onChange={(e) => setEvent(party, "title", e.target.value)} />
            </label>
            <label className="field">
              <span className="field__label">المكان</span>
              <input className="input" value={c.events[party].venue} onChange={(e) => setEvent(party, "venue", e.target.value)} />
            </label>
            <label className="field">
              <span className="field__label">العنوان التفصيلي</span>
              <input className="input" value={c.events[party].address} onChange={(e) => setEvent(party, "address", e.target.value)} />
            </label>
            <label className="field ivp__wide">
              <span className="field__label">رابط الموقع على الخريطة</span>
              <input
                className="input"
                dir="ltr"
                type="url"
                value={c.events[party].mapUrl}
                onChange={(e) => setEvent(party, "mapUrl", e.target.value)}
                placeholder="https://maps.app.goo.gl/…"
              />
              <span className="hint">من خرائط Google: شارك ← نسخ الرابط. فارغ = يظهر «الموقع قريباً».</span>
            </label>
            <label className="field ivp__wide">
              <span className="field__label">ملاحظة (اختياري)</span>
              <input className="input" value={c.events[party].note} onChange={(e) => setEvent(party, "note", e.target.value)} placeholder="مثلاً: يوجد موقف سيارات بجانب المزرعة" />
            </label>
          </div>
        </fieldset>
      ))}

      <fieldset className="card card--pad ivp__set">
        <legend>تأكيد الحضور</legend>
        <div className="ivp__grid">
          <label className="ivp__check ivp__wide">
            <input type="checkbox" checked={c.rsvpOpen} onChange={(e) => set("rsvpOpen", e.target.checked)} /> استقبال الردود مفتوح
          </label>
        </div>
      </fieldset>

      <fieldset className="card card--pad ivp__set">
        <legend>حالة صفحة الدعوة</legend>
        <div className="ivp__grid">
          <div className="field ivp__wide">
            <div className="seg" role="group" aria-label="حالة الصفحة">
              {INVITE_STATUSES.map((st) => (
                <button key={st} type="button" className="press" aria-pressed={c.status === st} onClick={() => set("status", st)}>
                  {STATUS_LABEL[st]}
                </button>
              ))}
            </div>
            <span className="hint">
              تلقائي: الدعوة تعمل حتى نهاية يوم الحفل، ثم تظهر صفحة «{c.endedTitle}» وحدها. «منتهية» تُظهرها الآن.
            </span>
          </div>
          {text("endedTitle", "عنوان صفحة ما بعد الزفاف")}
          {text("endedText", "كلمة الشكر", undefined, true)}
          <label className="ivp__check">
            <input type="checkbox" checked={c.galleryEnabled} onChange={(e) => set("galleryEnabled", e.target.checked)} /> عرض صور الزفاف تحتها
          </label>
          {text("galleryTitle", "عنوان معرض الصور بعد الزفاف")}
          {text("inviteGalleryTitle", "عنوان قسم الصور في الدعوة", "لا يظهر القسم ما لم تُرفع صور مخصّصة للدعوة")}
          <a className="btn btn--xs btn--ghost press" href={`/invite/general?preview=1&ended=1&theme=${c.theme}&font=${c.font}`} target="_blank" rel="noopener noreferrer">
            معاينة صفحة ما بعد الزفاف
          </a>
        </div>
      </fieldset>

      <fieldset className="card card--pad ivp__set">
        <legend>الخط</legend>
        <div className="theme-grid" role="radiogroup" aria-label="خط الدعوة">
          {INVITE_FONTS.map((f) => (
            <div key={f} className="theme-option" data-on={c.font === f || undefined}>
              <button type="button" role="radio" aria-checked={c.font === f} className="theme-option__pick press" onClick={() => set("font", f)}>
                <span className="theme-option__top">{config.font === f ? <span className="badge badge--good">مفعّل</span> : <span />}</span>
                <span className="ivp__font-sample" data-font={f}>
                  {c.groomShort} <span aria-hidden="true">♥</span> {c.brideDisplay}
                </span>
                <span className="muted small">{FONT_LABELS[f]}</span>
              </button>
              <a className="theme-option__preview" href={`/invite/general?preview=1&font=${f}&theme=${c.theme}`} target="_blank" rel="noopener noreferrer">
                معاينة
              </a>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="card card--pad ivp__set">
        <legend>لون الزخارف</legend>
        <p className="muted small ivp__set-note">
          الإطارات والخطوط والقلب والعناوين الصغيرة. «ذهبي» يبقي ذهب كل ثيم. الأبيض اللؤلؤي أبيض صافٍ في الوضع الداكن، ورمادي لؤلؤي فاتح في الوضع الفاتح حتى
          يبقى ظاهراً.
        </p>
        <div className="theme-grid" role="radiogroup" aria-label="لون الزخارف">
          {INVITE_METALS.map((m) => (
            <div key={m} className="theme-option" data-on={c.metal === m || undefined}>
              <button type="button" role="radio" aria-checked={c.metal === m} className="theme-option__pick press" onClick={() => set("metal", m)}>
                <span className="theme-option__top">
                  <span className="look__swatches" aria-hidden="true">
                    <span style={{ background: THEME_SWATCHES[c.theme][0] }} />
                    <span style={{ background: metalColor(m, c.theme) }} />
                    {m === "pearl" ? <span style={{ background: "#ffffff" }} /> : null}
                  </span>
                  {config.metal === m ? <span className="badge badge--good">مفعّل</span> : null}
                </span>
                <strong>{METAL_LABELS[m]}</strong>
              </button>
              <a
                className="theme-option__preview"
                href={`/invite/general?preview=1&theme=${c.theme}&metal=${m}&font=${c.font}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                معاينة
              </a>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="card card--pad ivp__set">
        <legend>الثيم</legend>
        <div className="theme-grid" role="radiogroup" aria-label="ثيم الدعوة">
          {INVITE_THEMES.map((t) => (
            <div key={t} className="theme-option" data-on={c.theme === t || undefined}>
              <button type="button" role="radio" aria-checked={c.theme === t} className="theme-option__pick press" onClick={() => set("theme", t)}>
                <span className="theme-option__top">
                  <span className="look__swatches" aria-hidden="true">
                      {[THEME_SWATCHES[t][0], THEME_SWATCHES[t][1], metalColor(c.metal, t)].map((color, i) => (
                      <span key={i} style={{ background: color }} />
                    ))}
                  </span>
                  {config.theme === t ? <span className="badge badge--good">مفعّل</span> : null}
                </span>
                <strong>{THEME_LABELS[t]}</strong>
                <span className="muted small">فاتح افتراضياً، ومعه وضع داكن</span>
              </button>
              <a className="theme-option__preview" href={`/invite/general?preview=1&theme=${t}&metal=${c.metal}&font=${c.font}`} target="_blank" rel="noopener noreferrer">
                معاينة
              </a>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="card card--pad ivp__set">
        <legend>تفاصيل صغيرة (التعليمات)</legend>
        <div className="ivp__rules">
          {c.rules.map((rule, i) => (
            <div key={i} className="ivp__rule">
              <select
                className="select"
                value={rule.icon}
                onChange={(e) => set("rules", c.rules.map((r, j) => (j === i ? { ...r, icon: e.target.value as RuleIcon } : r)))}
                aria-label="الأيقونة"
              >
                {RULE_ICONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {RULE_ICON_LABEL[icon]}
                  </option>
                ))}
              </select>
              <input
                className="input"
                value={rule.title}
                onChange={(e) => set("rules", c.rules.map((r, j) => (j === i ? { ...r, title: e.target.value } : r)))}
                placeholder="العنوان"
              />
              <input
                className="input ivp__rule-text"
                value={rule.text}
                onChange={(e) => set("rules", c.rules.map((r, j) => (j === i ? { ...r, text: e.target.value } : r)))}
                placeholder="النص"
              />
              <button type="button" className="btn btn--xs btn--danger-soft press" onClick={() => set("rules", c.rules.filter((_, j) => j !== i))}>
                حذف
              </button>
            </div>
          ))}
          {c.rules.length < 6 ? (
            <button type="button" className="btn btn--xs btn--soft press" onClick={() => set("rules", [...c.rules, { icon: "heart", title: "", text: "" }])}>
              + إضافة
            </button>
          ) : null}
        </div>
      </fieldset>

      <LogoField logo={logo} setLogo={setLogo} />
      <SongField />

      <div className="ivp__savebar" data-dirty={dirty || undefined}>
        <span className="small">
          {status === "saving" ? "جارٍ الحفظ…" : status === "saved" && !dirty ? "تم الحفظ ✓ — ظاهر الآن في الدعوة" : status === "error" ? "تعذّر الحفظ" : dirty ? "تعديلات غير محفوظة" : "لا تعديلات"}
        </span>
        <div className="message__actions">
          <button type="button" className="btn btn--sm btn--ghost press" disabled={!dirty} onClick={() => setC(config)}>
            تراجع
          </button>
          <button type="button" className="btn btn--sm press" disabled={!dirty || status === "saving"} onClick={save}>
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
}

function LogoField({ logo, setLogo }: { logo: string | null; setLogo: (l: string | null) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File | undefined) {
    if (!file) return;
    setError("");
    if (file.size > 600 * 1024) return setError(ERRORS.too_large);
    setBusy(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("read"));
        reader.readAsDataURL(file);
      });
      const response = await fetch("/api/admin/invite/logo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      const body = (await response.json().catch(() => ({}))) as { logo?: string; error?: string };
      if (!response.ok) throw new Error(body.error ?? "failed");
      setLogo(body.logo ?? null);
    } catch (failure) {
      setError(ERRORS[(failure as Error).message] ?? "تعذّر رفع الشعار.");
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    if (!window.confirm("حذف الشعار المرفوع والعودة إلى شعار الخطوبة؟")) return;
    setBusy(true);
    await fetch("/api/admin/invite/logo", { method: "DELETE" });
    setLogo(null);
    setBusy(false);
  }

  return (
    <fieldset className="card card--pad ivp__set">
      <legend>الشعار</legend>
      <div className="ivp__logo">
        <div className="ivp__logo-preview">
          <Monogram logoUrl={logo ? `/api/invite/logo?v=${encodeURIComponent(logo)}` : null} />
        </div>
        <div className="ivp__logo-actions">
          <p className="muted small">
            {logo ? "شعار مرفوع يظهر في الظرف والختم والدعوة." : "الشعار الحالي: شعار الخطوبة «أ إ»، ألفان متعانقان بهمزة فوق وهمزة تحت."} PNG أو SVG بخلفية شفافة، حتى ٦٠٠ كيلوبايت.
          </p>
          <div className="message__actions">
            <label className="btn btn--xs btn--soft press">
              {busy ? "جارٍ الرفع…" : "رفع شعار"}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={(e) => upload(e.target.files?.[0])} />
            </label>
            {logo ? (
              <button type="button" className="btn btn--xs btn--danger-soft press" onClick={reset} disabled={busy}>
                العودة إلى شعار الخطوبة
              </button>
            ) : null}
            <a className="btn btn--xs btn--ghost press" href="/invite/monogram.svg" download="monogram.svg">
              تنزيل الشعار SVG
            </a>
            <a className="btn btn--xs btn--ghost press" href="/invite/og.png" download="invitation.png">
              تنزيل صورة الدعوة
            </a>
          </div>
          {error ? <p className="error-text">{error}</p> : null}
        </div>
      </div>
    </fieldset>
  );
}

type Song = { version: string; type: string; name: string; size: number };

const SONG_ERRORS: Record<string, string> = {
  bad_type: "الصيغة غير مدعومة. ارفعوا فيديو MP4 أو MOV، أو ملف صوت MP3 أو M4A.",
  too_large: "الملف أكبر من ٦٠ ميغابايت.",
  no_storage: "التخزين غير متاح الآن.",
};

/** The couple's song: a video whose sound alone plays under the invitation. */
function SongField() {
  const [song, setSong] = useState<Song | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/admin/invite/song", { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<{ song: Song | null }>) : { song: null }))
      .then((b: { song: Song | null }) => setSong(b.song))
      .catch(() => undefined);
  }, []);

  async function upload(file: File | undefined) {
    if (!file) return;
    setError("");
    if (file.size > 60 * 1024 * 1024) return setError(SONG_ERRORS.too_large);
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/invite/song?name=${encodeURIComponent(file.name)}`, {
        method: "PUT",
        headers: { "Content-Type": file.type || "video/mp4" },
        body: file,
      });
      const body = (await response.json().catch(() => ({}))) as { song?: Song; error?: string };
      if (!response.ok) throw new Error(body.error ?? "failed");
      setSong(body.song ?? null);
    } catch (failure) {
      setError(SONG_ERRORS[(failure as Error).message] ?? `تعذّر رفع الملف (${(failure as Error).message}).`);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm("حذف الأغنية من الدعوة؟")) return;
    setBusy(true);
    await fetch("/api/admin/invite/song", { method: "DELETE" });
    setSong(null);
    setBusy(false);
  }

  const src = song ? `/api/invite/song?v=${song.version}` : null;

  return (
    <fieldset className="card card--pad ivp__set">
      <legend>الأغنية</legend>
      <p className="muted small ivp__set-note">
        ارفعوا فيديو الأغنية، فيُشغَّل صوته فقط في خلفية الدعوة من أول لمسة للضيف، مع زر صغير لإيقافه. الصورة لا تظهر. حتى ٦٠ ميغابايت.
      </p>
      {src ? <audio className="ivp__song" src={src} controls preload="none" /> : null}
      {song ? (
        <p className="muted small">
          {song.name || "ملف مرفوع"} · {(song.size / 1024 / 1024).toFixed(1)} ميغابايت
        </p>
      ) : null}
      <div className="message__actions">
        <label className="btn btn--xs btn--soft press">
          {busy ? "جارٍ الرفع…" : song ? "استبدال الفيديو" : "رفع فيديو"}
          <input type="file" accept="video/mp4,video/quicktime,video/webm,audio/*" hidden disabled={busy} onChange={(e) => upload(e.target.files?.[0])} />
        </label>
        {song ? (
          <button type="button" className="btn btn--xs btn--danger-soft press" onClick={remove} disabled={busy}>
            حذف الأغنية
          </button>
        ) : null}
      </div>
      {error ? <p className="error-text">{error}</p> : null}
    </fieldset>
  );
}
