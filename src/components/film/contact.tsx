"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { copy, profile, turnstileSiteKey, type Locale } from "@/lib/content";
import { Reveal } from "./reveal";

type Status = "idle" | "sending" | "sent" | "error";

/*
 * `Window.turnstile` is declared once, globally, by src/components/contact-form.tsx.
 * Redeclaring it here would conflict, and this form uses no more of the API
 * than that declaration already covers.
 */

/**
 * Contact. The form posts to the same `/api/contact` endpoint as the grid
 * site — identical validation, Turnstile enforcement, rate limiting and D1
 * persistence. Only the presentation differs: underline fields instead of
 * bordered boxes, and no borders anywhere else on the page.
 */
export function Contact({ locale }: { locale: Locale }) {
  const t = copy[locale].contact;
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [scriptReady, setScriptReady] = useState(false);
  const widgetId = useRef<string | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  const mountWidget = useCallback(() => {
    const host = hostRef.current;
    if (!host || !turnstileSiteKey || !window.turnstile || widgetId.current) return;

    widgetId.current = window.turnstile.render(host, {
      sitekey: turnstileSiteKey,
      // The Film design is always dark, so the widget never has to be themed.
      theme: "dark",
      size: "flexible",
      callback: (value: string) => setToken(value),
      "expired-callback": () => setToken(""),
      "error-callback": () => setToken(""),
    });
  }, []);

  useEffect(() => {
    if (turnstileSiteKey && window.turnstile) mountWidget();
  }, [scriptReady, mountWidget]);

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
          "cf-turnstile-response": token,
        }),
      });

      const body = (await response.json()) as { ok: boolean; error?: string };

      if (response.ok && body.ok) {
        setStatus("sent");
        form.reset();
        return;
      }

      setError(t.form.errors[body.error ?? "generic"] ?? t.form.errors.generic);
      setStatus("error");
      // Let the visitor retry immediately instead of waiting for a new widget.
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
      setToken("");
    } catch {
      setError(t.form.errors.generic);
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="px-gutter pt-20 pb-16 md:pt-28 md:pb-24">
      <div className="mx-auto" style={{ maxWidth: "var(--film-shell)" }}>
        <Reveal className="mb-14 md:mb-20">
          <p className="label mb-6">{t.label}</p>
          <h2 className="display-sm mb-8 max-w-[18ch] text-[clamp(2.25rem,7vw,5.5rem)] text-balance">
            {t.headline}
          </h2>
          <p className="lead">{t.body}</p>
        </Reveal>

        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <Reveal className="md:col-span-5">
            <p className="label mb-6">{t.fallback}</p>
            <a
              href={`mailto:${profile.email}`}
              className="display-sm mb-10 block break-all text-[clamp(1.25rem,2.4vw,1.875rem)] transition-colors duration-700 hover:text-beam"
            >
              {profile.email}
            </a>

            <dl className="space-y-6">
              {t.channels
                .filter((channel) => channel.id !== "email")
                .map((channel) => (
                  <div key={channel.id}>
                    <dt className="label mb-1.5">{channel.label}</dt>
                    <dd className="text-[0.9375rem] font-light text-ivory-2">{channel.value}</dd>
                  </div>
                ))}
            </dl>
          </Reveal>

          <Reveal delay={120} className="md:col-span-6 md:col-start-7">
            {status === "sent" ? (
              <div className="rounded-3xl bg-white/[0.03] p-10">
                <p className="label mb-4 text-beam">200 / OK</p>
                <p className="body-quiet mb-8 max-w-[40ch]">{t.form.success}</p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="text-[0.875rem] text-ivory-3 underline underline-offset-4 transition-colors duration-500 hover:text-ivory"
                >
                  {t.form.sendAnother} ↗
                </button>
              </div>
            ) : (
              <>
                <Script
                  src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
                  strategy="afterInteractive"
                  onLoad={() => setScriptReady(true)}
                  onReady={() => setScriptReady(true)}
                />

                <form onSubmit={onSubmit} noValidate className="space-y-9">
                  <div className="grid gap-9 sm:grid-cols-2">
                    <Field id="fm-name" label={t.form.name}>
                      <input
                        id="fm-name"
                        name="name"
                        type="text"
                        required
                        maxLength={100}
                        autoComplete="name"
                        placeholder="Jane Doe"
                        className="field"
                      />
                    </Field>

                    <Field id="fm-email" label={t.form.email}>
                      <input
                        id="fm-email"
                        name="email"
                        type="email"
                        required
                        maxLength={200}
                        autoComplete="email"
                        placeholder="you@company.com"
                        className="field"
                      />
                    </Field>

                    <Field id="fm-topic" label={t.form.topic} className="sm:col-span-2">
                      <select id="fm-topic" name="topic" defaultValue="" className="field">
                        <option value="">—</option>
                        {t.form.topics.map((topic) => (
                          <option key={topic.value} value={topic.value} className="bg-stage">
                            {topic.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field id="fm-message" label={t.form.message} className="sm:col-span-2">
                      <textarea
                        id="fm-message"
                        name="message"
                        required
                        rows={4}
                        maxLength={4000}
                        placeholder={t.form.messageHint}
                        className="field resize-y"
                      />
                    </Field>
                  </div>

                  {/* Honeypot — off-screen, not display:none, so bots still fill it. */}
                  <div
                    aria-hidden="true"
                    className="absolute h-0 w-0 overflow-hidden"
                    style={{ insetInlineStart: -9999 }}
                  >
                    <label htmlFor="fm-company">Company</label>
                    <input
                      id="fm-company"
                      name="company"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div ref={hostRef} className="min-h-0" />

                  {error ? (
                    <p role="alert" className="text-[0.875rem] text-beam">
                      {error}
                    </p>
                  ) : null}

                  <button type="submit" disabled={status === "sending"} className="pill">
                    <span>{status === "sending" ? t.form.sending : t.form.submit}</span>
                    <span data-disc aria-hidden="true">
                      {status === "sending" ? "···" : "→"}
                    </span>
                  </button>
                </form>
              </>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  className = "",
  children,
}: {
  id: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label mb-1 block">
        {label}
      </label>
      {children}
    </div>
  );
}