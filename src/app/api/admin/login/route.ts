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

const MAX_ATTEMPTS = 8;
const LOCKOUT_MINUTES = 15;

type D1Row = { attempts: number; last_attempt: string };

function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ??
    "unknown"
  );
}

export async function POST(request: Request) {
  const env = (await getEnv()) as AdminEnv;
  const noStore = { "Cache-Control": "no-store" };

  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD_HASH || !env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503, headers: noStore });
  }

  let username = "";
  let password = "";
  try {
    const body = (await request.json()) as { username?: string; password?: string };
    username = String(body.username ?? "").slice(0, 128);
    password = String(body.password ?? "");
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400, headers: noStore });
  }

  const ip = clientIp(request);
  const db = env.CONTACT_DB;

  /* -- Throttle ----------------------------------------------------- */
  if (db) {
    try {
      const cutoff = new Date(Date.now() - LOCKOUT_MINUTES * 60_000).toISOString().replace("T", " ").slice(0, 19);
      const row = await db
        .prepare(`SELECT attempts, last_attempt FROM admin_login_attempts WHERE ip = ?1`)
        .bind(ip)
        .first<D1Row>();

      if (row && row.attempts >= MAX_ATTEMPTS && row.last_attempt >= cutoff) {
        return NextResponse.json({ ok: false, error: "locked" }, { status: 429, headers: noStore });
      }
    } catch {
      // A throttle outage must not become an auth bypass.
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
        await db
          .prepare(
            `INSERT INTO admin_login_attempts (ip, attempts, last_attempt)
             VALUES (?1, 1, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
             ON CONFLICT(ip) DO UPDATE SET
               attempts = attempts + 1,
               last_attempt = strftime('%Y-%m-%dT%H:%M:%fZ','now')`,
          )
          .bind(ip)
          .run();
      } catch {
        // Non-fatal.
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