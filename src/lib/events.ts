/*
 * Admin → Stats: per-day counters in D1 (site_events). One row per day, kind,
 * label and language; a visit or a click adds one. Nothing identifies a person.
 */

export const EVENT_KINDS = ["view", "click", "lead", "ref", "country"] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

/** Labels are short machine words: paths, hosts, button names, country codes. */
export const LABEL_RE = /^[a-z0-9/][a-z0-9:/_.-]{0,79}$/i;

/**
 * Crawlers and link previewers run no beacon, but some headless ones do. In-app
 * browsers (Telegram, WhatsApp, Instagram) are real people and stay counted.
 */
export const BOT_UA = /bot\b|crawl|spider|slurp|headless|lighthouse|facebookexternalhit/i;

export const today = () => new Date().toISOString().slice(0, 10);

export function countStatement(db: D1Database, kind: EventKind, label: string, locale = "") {
  return db
    .prepare(
      `INSERT INTO site_events (day, kind, label, locale, count) VALUES (?1, ?2, ?3, ?4, 1)
       ON CONFLICT(day, kind, label, locale) DO UPDATE SET count = count + 1`,
    )
    .bind(today(), kind, label.slice(0, 80), locale);
}
