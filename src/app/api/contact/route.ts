import { NextResponse } from "next/server";

/* ------------------------------------------------------------------ *
 *  POST /api/contact
 *
 *  Validates, rate-limits, stores, then notifies. Every external effect
 *  is best-effort: the row in D1 is the source of truth, so a mail
 *  outage never loses a message.
 * ------------------------------------------------------------------ */

const LIMITS = {
  name: 100,
  email: 200,
  topic: 60,
  message: 4000,
} as const;

const RATE_LIMIT = { max: 5, windowMinutes: 60 } as const;

// Deliberately permissive: the goal is rejecting obvious typos, not
// adjudicating RFC 5322. Anything stricter turns away valid addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

// Control characters with no business in a text field. Tab, newline and
// carriage return are kept so multi-line messages survive.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const ALLOWED_TOPICS = new Set(["product", "telegram", "infrastructure", "it", "other"]);

/**
 * Bindings as declared in wrangler.jsonc. The generated `CloudflareEnv`
 * (worker-configuration.d.ts, via `pnpm cf-typegen`) makes every binding
 * required — outside the Cloudflare adapter none of them exist, so they are
 * modelled as optional here and the handler degrades instead of throwing.
 */
type Env = Partial<
  CloudflareEnv & {
    TURNSTILE_SECRET?: string;
  }
>;

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verify a Turnstile token. Returns true when no secret is configured so the
 * form keeps working in local development and on hosts without Turnstile.
 */
async function verifyTurnstile(
  secret: string | undefined,
  token: string,
  ip: string,
): Promise<boolean> {
  if (!secret) return true;
  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token, remoteip: ip });

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    if (!response.ok) return false;

    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch (error) {
    // Fail closed on a Turnstile outage: better to reject than to let the
    // spam through that the widget exists to stop.
    console.error("[contact] turnstile verify failed", error);
    return false;
  }
}

type Payload = {
  id: number;
  name: string;
  email: string;
  topic: string;
  message: string;
  locale: string;
  ip: string;
};

type Result =
  | { ok: true; persisted: boolean; notified: boolean }
  | { ok: false; status: number; error: string };

const TOPIC_LABELS: Record<string, string> = {
  product: "Product engineering",
  telegram: "Telegram commerce",
  infrastructure: "Infrastructure & DevOps",
  it: "IT support",
  other: "Something else",
};

/** Escape untrusted text before it goes anywhere near HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(CONTROL_CHARS, "").trim().slice(0, max);
}

function clientIp(request: Request): string {
  const edge = request.headers.get("cf-connecting-ip");
  if (edge) return edge.slice(0, 45);
  const forwarded = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  return forwarded.slice(0, 45) || "unknown";
}

function json(body: Result, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  // Bindings only exist under the Cloudflare adapter. Outside it — plain
  // `next dev`, Vercel, a test runner — the form still validates and logs.
  let env: Env = {};
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const context = await getCloudflareContext({ async: true });
    env = context.env as Env;
  } catch {
    env = {};
  }

  /* -- Parse ---------------------------------------------------------- */
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, status: 400, error: "invalid_json" }, 400);
  }

  // Honeypot: a real person never sees this field. Answer with the shape a
  // successful submission returns, so a bot learns nothing.
  if (clean(payload.company, 100) !== "") {
    return json({ ok: true, persisted: false, notified: false });
  }

  /* -- Validate ------------------------------------------------------- */
  const name = clean(payload.name, LIMITS.name);
  const email = clean(payload.email, LIMITS.email);
  const message = clean(payload.message, LIMITS.message);
  const topic = clean(payload.topic, LIMITS.topic);
  const locale = clean(payload.locale, 5);

  if (name.length < 2) return json({ ok: false, status: 400, error: "name_required" }, 400);
  if (!EMAIL_RE.test(email)) return json({ ok: false, status: 400, error: "email_invalid" }, 400);
  if (message.length < 10) return json({ ok: false, status: 400, error: "message_too_short" }, 400);
  if (topic && !ALLOWED_TOPICS.has(topic)) {
    return json({ ok: false, status: 400, error: "topic_invalid" }, 400);
  }

  const ip = clientIp(request);
  const userAgent = clean(request.headers.get("user-agent"), 300);

  /* -- Turnstile ----------------------------------------------------- */
  const turnstileToken = clean(payload["cf-turnstile-response"], 2048);
  if (!(await verifyTurnstile(env.TURNSTILE_SECRET, turnstileToken, ip))) {
    return json({ ok: false, status: 400, error: "turnstile_failed" }, 400);
  }

  /* -- Rate limit ----------------------------------------------------- */
  const db = env.CONTACT_DB;
  if (db) {
    try {
      const windowStart = new Date(Date.now() - RATE_LIMIT.windowMinutes * 60_000)
        .toISOString()
        .replace("T", " ")
        .slice(0, 19);

      const recent = await db
        .prepare(
          `SELECT COUNT(*) AS n FROM contact_messages
           WHERE ip = ?1 AND created_at >= ?2`,
        )
        .bind(ip, windowStart)
        .first<{ n: number }>();

      if (Number(recent?.n ?? 0) >= RATE_LIMIT.max) {
        return json({ ok: false, status: 429, error: "rate_limited" }, 429);
      }
    } catch (error) {
      // Never turn a limiter outage into a lost message.
      console.error("[contact] rate limit check failed", error);
    }
  }

  /* -- Persist -------------------------------------------------------- */
  let persisted = false;
  let rowId = 0;

  if (db) {
    try {
      const result = await db
        .prepare(
          `INSERT INTO contact_messages (name, email, topic, message, locale, ip, user_agent)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
        )
        .bind(name, email, topic || null, message, locale || null, ip, userAgent || null)
        .run();

      rowId = Number(result.meta?.last_row_id ?? 0);
      persisted = true;
    } catch (error) {
      console.error("[contact] insert failed", error);
    }
  } else {
    console.info("[contact] no D1 binding; validated only", {
      name,
      email,
      topic,
      length: message.length,
    });
  }

  /* -- Notify --------------------------------------------------------- */
  let notified = false;
  const to = env.CONTACT_TO_EMAIL;
  const from = env.CONTACT_FROM_EMAIL;

  if (env.EMAIL && to && from) {
    const detail = { id: rowId, name, email, topic, message, locale, ip };
    try {
      await env.EMAIL.send({
        to,
        from: { email: from, name: "ghawi.app" },
        replyTo: email,
        subject: `[ghawi.app] ${name}${topic ? ` · ${TOPIC_LABELS[topic] ?? topic}` : ""}${rowId ? ` #${rowId}` : ""}`,
        html: renderHtml(detail),
        text: renderText(detail),
      });
      notified = true;

      if (db && rowId) {
        await db
          .prepare(`UPDATE contact_messages SET notified = 1 WHERE id = ?1`)
          .bind(rowId)
          .run()
          .catch((error) => console.error("[contact] notified flag failed", error));
      }
    } catch (error) {
      // Already safe in D1 — still report success, just log the failure.
      console.error("[contact] email failed", error);
    }
  }

  return json({ ok: true, persisted, notified });
}

/* ------------------------------------------------------------------ */

function renderHtml(p: Payload): string {
  const row = (label: string, value: string) =>
    `<tr>
       <td style="padding:6px 12px 6px 0;color:#67717a;font:12px ui-monospace,monospace;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td>
       <td style="padding:6px 0;color:#edf0f2;font:14px -apple-system,Segoe UI,sans-serif">${escapeHtml(value)}</td>
     </tr>`;

  return `<!doctype html>
<html><body style="margin:0;background:#07080a;padding:24px">
  <div style="max-width:600px;margin:0 auto;border:1px solid #1c2126;background:#0a0c0f">
    <div style="border-bottom:1px solid #1c2126;padding:16px 24px">
      <span style="color:#d4ff3f;font:12px ui-monospace,monospace;letter-spacing:.14em">GHAWI.APP</span>
      <span style="color:#67717a;font:12px ui-monospace,monospace;letter-spacing:.14em">&#8195;/&#8195;CONTACT${p.id ? ` #${p.id}` : ""}</span>
    </div>
    <div style="padding:24px">
      <table role="presentation" style="border-collapse:collapse;width:100%">
        ${row("From", p.name)}
        ${row("Email", p.email)}
        ${row("Topic", p.topic ? (TOPIC_LABELS[p.topic] ?? p.topic) : "-")}
        ${row("Locale", p.locale || "-")}
        ${row("IP", p.ip)}
      </table>
      <div style="margin-top:20px;border-top:1px solid #1c2126;padding-top:20px">
        <div style="color:#67717a;font:12px ui-monospace,monospace;letter-spacing:.14em;margin-bottom:8px">MESSAGE</div>
        <div style="color:#edf0f2;font:15px/1.65 -apple-system,Segoe UI,sans-serif;white-space:pre-wrap">${escapeHtml(p.message)}</div>
      </div>
    </div>
    <div style="border-top:1px solid #1c2126;padding:14px 24px">
      <a href="https://ghawi.app" style="color:#67717a;font:12px ui-monospace,monospace;text-decoration:none">ghawi.app</a>
    </div>
  </div>
</body></html>`;
}

function renderText(p: Payload): string {
  return [
    `New message from ghawi.app${p.id ? ` (#${p.id})` : ""}`,
    "",
    `From:    ${p.name}`,
    `Email:   ${p.email}`,
    `Topic:   ${p.topic ? (TOPIC_LABELS[p.topic] ?? p.topic) : "-"}`,
    `Locale:  ${p.locale || "-"}`,
    `IP:      ${p.ip}`,
    "",
    "Message:",
    p.message,
    "",
    "---",
    "Reply directly to this email to answer.",
  ].join("\n");
}