"use client";

import { useRef, useState, type FormEvent } from "react";
import type { Copy, Locale } from "@/lib/content";

type Status = "idle" | "sending" | "sent" | "error";

const FIELD =
  "w-full border border-line bg-bg-1 px-4 py-3 text-[14px] text-fg " +
  "placeholder:text-fg-3/70 transition-colors duration-200 " +
  "hover:border-line-2 focus:border-acc focus:outline-none";

const LABEL = "mono mb-2 block text-[10.5px] tracking-[0.14em] text-fg-3 uppercase";

export function ContactForm({
  t,
  locale,
}: {
  t: Copy["contact"]["form"];
  locale: Locale;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          topic: data.get("topic"),
          message: data.get("message"),
          company: data.get("company"),
          locale,
        }),
      });

      const body = (await response.json()) as { ok: boolean; error?: string };

      if (response.ok && body.ok) {
        setStatus("sent");
        form.reset();
        return;
      }

      const key = body.error ?? "generic";
      setError(t.errors[key] ?? t.errors.generic);
      setStatus("error");
    } catch {
      setError(t.errors.generic);
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="mt-12 border border-acc-line bg-acc-soft/25 p-8">
        <span className="mono flex items-center gap-2 text-[10.5px] tracking-[0.14em] text-acc uppercase">
          <span className="pulse-dot" aria-hidden="true" />
          200 / OK
        </span>
        <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-fg">{t.success}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mono mt-6 text-[11px] tracking-[0.12em] text-fg-3 uppercase underline underline-offset-4 transition-colors hover:text-acc"
        >
          {t.sendAnother} ↗
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="mt-12 border-t border-line pt-10"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className={LABEL}>
            {t.name}
          </label>
          <input
            id="cf-name"
            name="name"
            type="text"
            required
            maxLength={100}
            autoComplete="name"
            placeholder="Jane Doe"
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="cf-email" className={LABEL}>
            {t.email}
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            placeholder="you@company.com"
            className={FIELD}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="cf-topic" className={LABEL}>
            {t.topic}
          </label>
          <select id="cf-topic" name="topic" defaultValue="" className={`${FIELD} appearance-none`}>
            <option value="">—</option>
            {t.topics.map((topic) => (
              <option key={topic.value} value={topic.value}>
                {topic.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="cf-message" className={LABEL}>
            {t.message}
          </label>
          <textarea
            id="cf-message"
            name="message"
            required
            rows={5}
            maxLength={4000}
            placeholder={t.messageHint}
            className={`${FIELD} resize-y`}
          />
        </div>
      </div>

      {/* Honeypot — hidden from people, irresistible to naive bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="cf-company">Company</label>
        <input id="cf-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-5 border-s-2 border-acc bg-acc-soft/20 px-4 py-3 text-[13px] text-fg"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="sweep mono mt-7 inline-flex h-12 w-full items-center justify-center gap-2.5 border border-line-2 text-[12px] tracking-[0.12em] text-fg uppercase transition-colors duration-200 hover:text-bg disabled:opacity-60 sm:w-auto sm:px-8"
      >
        <span className="relative z-10">
          {status === "sending" ? t.sending : t.submit}
        </span>
        <span className="relative z-10" aria-hidden="true">
          {status === "sending" ? "···" : "→"}
        </span>
      </button>
    </form>
  );
}