import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  type AdminEnv,
  createSessionToken,
  getEnv,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/admin-server";
import { clientIp, minutesAgo } from "@/lib/request";

const MAX_ATTEMPTS = 8;
const LOCKOUT_MINUTES = 15;

type AttemptRow = { attempts: number; last_attempt: string };

const noStore = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  const env = ((await getEnv()) ?? {}) as AdminEnv;

  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD_HASH || !env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503, headers: noStore });
  }

  let username = "";
  let password = "";
  try {
    const body = (await request.json()) as { username?: string; password?: string };
    username = String(body.username ?? "").slice(0, 128);
    password = String(body.password ?? "").slice(0, 1024);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400, headers: noStore });
  }

  const ip = clientIp(request);
  const db = env.CONTACT_DB;
  // Same text form D1 stores `last_attempt` in, so comparing strings compares times.
  const cutoff = minutesAgo(LOCKOUT_MINUTES);

  /* -- Throttle ----------------------------------------------------- */
  if (db) {
    try {
      const row = await db
        .prepare(`SELECT attempts, last_attempt FROM admin_login_attempts WHERE ip = ?1`)
        .bind(ip)
        .first<AttemptRow>();

      if (row && row.attempts >= MAX_ATTEMPTS && row.last_attempt >= cutoff) {
        return NextResponse.json({ ok: false, error: "locked" }, { status: 429, headers: noStore });
      }
    } catch {
      // Fail closed: a throttle we cannot read must not become unlimited guesses.
      return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503, headers: noStore });
    }
  }

  /* -- Verify -------------------------------------------------------- */
  const usernameOk = username === env.ADMIN_USERNAME;
  // Always run the KDF so a wrong username and a wrong password cost the
  // same time — otherwise the response time enumerates the username.
  const passwordOk = await verifyPassword(password, env.ADMIN_PASSWORD_HASH);

  if (!usernameOk || !passwordOk) {
    if (db) {
      try {
        // A failure after a quiet spell starts a fresh window rather than
        // inheriting old strikes.
        await db
          .prepare(
            `INSERT INTO admin_login_attempts (ip, attempts, last_attempt)
             VALUES (?1, 1, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
             ON CONFLICT(ip) DO UPDATE SET
               attempts = CASE WHEN last_attempt < ?2 THEN 1 ELSE attempts + 1 END,
               last_attempt = strftime('%Y-%m-%dT%H:%M:%fZ','now')`,
          )
          .bind(ip, cutoff)
          .run();
      } catch {
        // Non-fatal: the next attempt reads the throttle again.
      }
    }
    return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401, headers: noStore });
  }

  /* -- Issue session ------------------------------------------------- */
  if (db) {
    try {
      await db.prepare(`DELETE FROM admin_login_attempts WHERE ip = ?1`).bind(ip).run();
    } catch {
      // Non-fatal.
    }
  }

  const token = await createSessionToken(env.ADMIN_SESSION_SECRET, username);
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, sessionCookieOptions);

  return NextResponse.json({ ok: true }, { headers: noStore });
}
