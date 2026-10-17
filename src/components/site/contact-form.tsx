"use client";

import Script from "next/script";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import type { Dictionary, Locale } from "@/lib/content";

type FormCopy = Dictionary["contact"]["form"];
type Status = "idle" | "verifying" | "sending" | "sent";
type Field = "name" | "email" | "topic" | "message";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
  }
}

/** Same rules as the server (src/app/api/contact/route.ts); it has the final word. */
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/** Which field an error code belongs to, so it can be marked and focused. */
const FIELD_OF: Record<string, Field> = {
  name_required: "name",
  email_invalid: "email",
  topic_invalid: "topic",
  message_too_short: "message",
};

/** How long a submit waits for Turnstile's token before giving up. */
const TOKEN_WAIT_MS = 10_000;

function validate(data: FormData): string | null {
  if (String(data.get("name") ?? "").trim().length < 2) return "name_required";
  if (!EMAIL_RE.test(String(data.get("email") ?? "").trim())) return "email_invalid";
  if (String(data.get("message") ?? "").trim().length < 10) return "message_too_short";
  return null;
}

export function ContactForm({ t, locale, siteKey }: { t: FormCopy; locale: Locale; siteKey?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [scriptWanted, setScriptWanted] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const token = useRef("");
  const waiting = useRef<((value: string) => void)[]>([]);

  // Load Cloudflare's script only once the form is close to the screen:
  // most visitors never scroll this far, and they shouldn't pay for it.
  useEffect(() => {
    const form = formRef.current;
    if (!siteKey || !form) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setScriptWanted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, [siteKey]);

  // Mount the widget once. "interaction-only" keeps it invisible unless
  // Cloudflare actually needs the visitor to do something.
  useEffect(() => {
    const host = hostRef.current;
    if (!siteKey || !scriptReady || !host || !window.turnstile || widgetId.current) return;

    widgetId.current = window.turnstile.render(host, {
      sitekey: siteKey,
      theme: "auto",
      size: "flexible",
      appearance: "interaction-only",
      language: locale,
      callback: (value: string) => {
        token.current = value;
        release(value);
      },
      // An expired token refreshes itself; nobody needs waking for that.
      "expired-callback": () => {
        token.current = "";
      },
      // A widget that errors won't produce a token: answer any waiting submit now.
      "error-callback": () => {
        token.current = "";
        release("");
      },
    });

    return () => {
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey, scriptReady, locale]);

  /** Hands a token (or "" on failure) to every submit waiting for one. */
  function release(value: string) {
    for (const resolve of waiting.current.splice(0)) resolve(value);
  }

  function tokenOrTimeout(): Promise<string> {
    if (!siteKey || token.current) return Promise.resolve(token.current);
    setScriptWanted(true);
    return new Promise((resolve) => {
      waiting.current.push(resolve);
      window.setTimeout(() => resolve(token.current), TOKEN_WAIT_MS);
    });
  }

  function fail(code: string) {
    setError(code);
    setStatus("idle");
    const field = FIELD_OF[code];
    if (field) formRef.current?.querySelector<HTMLElement>(`[name="${field}"]`)?.focus();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending" || status === "verifying") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const invalid = validate(data);
    if (invalid) return fail(invalid);

    setError(null);
    setStatus("verifying");
    const turnstileToken = await tokenOrTimeout();
    setStatus("sending");

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
          "cf-turnstile-response": turnstileToken,
        }),
      });
      const body = (await response.json().catch(() => ({ ok: false }))) as { ok: boolean; error?: string };

      if (response.ok && body.ok) {
        form.reset();
        setStatus("sent");
        return;
      }
      fail(body.error ?? "generic");
    } catch {
      fail("generic");
    } finally {
      // A token is single-use; fetch a fresh one for any retry.
      token.current = "";
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    }
  }

  const invalidField = error ? FIELD_OF[error] : undefined;
  const busy = status === "sending" || status === "verifying";

  if (status === "sent") {
    return (
      <div className="form-done" role="status">
        <span className="form-done__icon" aria-hidden="true">
          <CheckIcon size={30} />
        </span>
        <h4>{t.successTitle}</h4>
        <p>{t.successBody}</p>
        <button type="button" className="btn btn--sm btn--soft press" onClick={() => setStatus("idle")}>
          {t.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <>
      {siteKey && scriptWanted ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onReady={() => setScriptReady(true)}
          // Blocked or offline: don't leave a submit waiting on a script that won't come.
          onError={() => release("")}
        />
      ) : null}

      <form ref={formRef} onSubmit={onSubmit} noValidate className="form-grid" aria-busy={busy}>
        <label className="field">
          <span className="field__label">{t.name}</span>
          <input
            className="input"
            name="name"
            type="text"
            required
            maxLength={100}
            autoComplete="name"
            aria-invalid={invalidField === "name" || undefined}
            aria-describedby={invalidField === "name" ? "form-error" : undefined}
          />
        </label>

        <label className="field">
          <span className="field__label">{t.email}</span>
          <input
            className="input"
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            inputMode="email"
            dir="ltr"
            aria-invalid={invalidField === "email" || undefined}
            aria-describedby={invalidField === "email" ? "form-error" : undefined}
          />
        </label>

        <label className="field span-2">
          <span className="field__label">{t.topic}</span>
          <select
            className="select"
            name="topic"
            defaultValue=""
            aria-invalid={invalidField === "topic" || undefined}
            aria-describedby={invalidField === "topic" ? "form-error" : undefined}
          >
            <option value="">{t.topicPlaceholder}</option>
            {t.topics.map((topic) => (
              <option key={topic.value} value={topic.value}>
                {topic.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field span-2">
          <span className="field__label">{t.message}</span>
          <textarea
            className="textarea"
            name="message"
            required
            rows={5}
            maxLength={4000}
            placeholder={t.messageHint}
            aria-invalid={invalidField === "message" || undefined}
            aria-describedby={invalidField === "message" ? "form-error" : undefined}
          />
        </label>

        {/* Honeypot — hidden from people, irresistible to naive bots. Clipped
            in place rather than pushed off-screen, which in RTL would widen the page. */}
        <div aria-hidden="true" className="sr-only">
          <label>
            Company
            <input name="company" type="text" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {siteKey ? <div ref={hostRef} className="turnstile span-2" /> : null}

        {error ? (
          <p id="form-error" role="alert" className="form-alert span-2">
            {t.errors[error] ?? t.errors.generic}
          </p>
        ) : null}

        <div className="span-2">
          <button type="submit" className="btn btn--block press" disabled={busy}>
            {busy ? <span className="spinner" aria-hidden="true" /> : null}
            {status === "verifying" ? t.verifying : status === "sending" ? t.sending : t.submit}
            {busy ? null : <ArrowIcon />}
          </button>
        </div>
      </form>
    </>
  );
}
