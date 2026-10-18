"use client";

import { useState, type FormEvent } from "react";
import { arabicDigits, people, type InviteRsvp, type PartyKey } from "@/lib/invite";
import { burst } from "./confetti";

type Props = {
  slug: string;
  /** null on the general link: the guest writes their own name. */
  guestName: string | null;
  parties: PartyKey[];
  partyTitles: Record<PartyKey, string>;
  seats: number;
  existing: InviteRsvp | null;
  closed: boolean;
};

type Status = "idle" | "sending" | "sent" | "error";

const ERRORS: Record<string, string> = {
  closed: "تأكيد الحضور مغلق الآن.",
  too_many: "العدد أكبر من المقاعد المخصّصة لهذه الدعوة.",
  need_name: "اكتبوا الاسم من فضلكم.",
  need_count: "اختاروا عدد الحاضرين.",
  rate_limited: "وصلنا عدد كبير من الردود من هذا الجهاز، حاولوا بعد قليل.",
};

/** "هل ستشاركوننا الفرح؟" — yes with how many, or a kind no, plus a word for the couple. */
export function RsvpForm({ slug, guestName, parties, partyTitles, seats, existing, closed }: Props) {
  const isGeneral = guestName === null;
  const [attending, setAttending] = useState<boolean | null>(existing ? existing.attending : null);
  const [counts, setCounts] = useState<Record<PartyKey, number>>(() => ({
    men: existing?.men ?? (parties[0] === "men" ? 1 : 0),
    women: existing?.women ?? (parties[0] === "women" ? 1 : 0),
  }));
  const [name, setName] = useState(isGeneral ? "" : (guestName ?? ""));
  const [message, setMessage] = useState(existing?.message ?? "");
  const [status, setStatus] = useState<Status>(existing && !isGeneral ? "sent" : "idle");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  const total = parties.reduce((sum, key) => sum + counts[key], 0);
  const left = seats - total;

  function step(key: PartyKey, delta: number) {
    setCounts((c) => {
      const next = Math.max(0, c[key] + delta);
      const others = parties.filter((k) => k !== key).reduce((sum, k) => sum + c[k], 0);
      return next + others > seats ? c : { ...c, [key]: next };
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (attending === null) return;
    if (isGeneral && !name.trim()) {
      setError(ERRORS.need_name);
      return;
    }
    if (attending && total < 1) {
      setError(ERRORS.need_count);
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/invite/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name: name.trim(),
          attending,
          men: attending && parties.includes("men") ? counts.men : 0,
          women: attending && parties.includes("women") ? counts.women : 0,
          message: message.trim(),
        }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "failed");
      setStatus("sent");
      setEditing(false);
      if (attending) burst();
    } catch (failure) {
      setStatus("error");
      setError(ERRORS[(failure as Error).message] ?? "تعذّر الإرسال، حاولوا مرة أخرى.");
    }
  }

  if (status === "sent" && !editing) {
    return (
      <div className="rsvp-done">
        <span className="rsvp-done__icon" aria-hidden="true">
          {attending ? "♡" : "✿"}
        </span>
        <h3>{attending ? "وصلنا تأكيدكم، شكراً من القلب" : "وصلنا ردّكم، ونقدّر محبتكم"}</h3>
        <p>
          {attending
            ? `ننتظركم بشوق${total > 1 ? ` — ${people(total)}` : ""}. سيكون حضوركم أجمل ما في الفرح.`
            : "سنفتقدكم، ودعواتكم تصلنا وتكفينا."}
        </p>
        {!isGeneral && !closed ? (
          <button type="button" className="iv-link" onClick={() => setEditing(true)}>
            تعديل الرد
          </button>
        ) : null}
      </div>
    );
  }

  if (closed) {
    return (
      <div className="rsvp-done">
        <h3>تأكيد الحضور مغلق الآن</h3>
        <p>للتواصل بشأن الحضور، راسلوا العائلة مباشرة.</p>
      </div>
    );
  }

  return (
    <form className="rsvp" onSubmit={submit} noValidate>
      {isGeneral ? (
        <label className="field">
          <span>الاسم</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" placeholder="مثلاً: عائلة أبو محمد" />
        </label>
      ) : null}

      <div className="rsvp__choices" role="radiogroup" aria-label="الحضور">
        <button type="button" role="radio" aria-checked={attending === true} className="choice" onClick={() => setAttending(true)}>
          <span className="choice__mark" aria-hidden="true" />
          بكل سرور، سنحضر
        </button>
        <button type="button" role="radio" aria-checked={attending === false} className="choice" onClick={() => setAttending(false)}>
          <span className="choice__mark" aria-hidden="true" />
          نعتذر عن الحضور
        </button>
      </div>

      {attending ? (
        <div className="rsvp__counts">
          {parties.map((key) => (
            <div key={key} className="stepper">
              <span className="stepper__label">
                عدد الحضور في {partyTitles[key]}
              </span>
              <div className="stepper__ctl">
                <button type="button" onClick={() => step(key, 1)} disabled={left <= 0} aria-label="زيادة">
                  +
                </button>
                <output aria-live="polite">{arabicDigits(counts[key])}</output>
                <button type="button" onClick={() => step(key, -1)} disabled={counts[key] <= 0} aria-label="إنقاص">
                  −
                </button>
              </div>
            </div>
          ))}
          <p className="rsvp__seats">
            {isGeneral ? `حتى ${people(seats)}` : `هذه الدعوة تتّسع لـ ${people(seats)}`}
          </p>
        </div>
      ) : null}

      {attending !== null ? (
        <label className="field">
          <span>كلمة للعروسين (اختياري)</span>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={400} rows={3} placeholder="بالرفاه والبنين، ألف مبروك…" />
        </label>
      ) : null}

      {error ? (
        <p className="rsvp__error" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="iv-btn iv-btn--solid" disabled={attending === null || status === "sending"}>
        {status === "sending" ? "جارٍ الإرسال…" : "أرسل الرد"}
      </button>
    </form>
  );
}
