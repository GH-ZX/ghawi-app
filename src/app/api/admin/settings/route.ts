import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, type AdminEnv, getEnv, isAuthenticated } from "@/lib/admin-server";

export const dynamic = "force-dynamic";

/** Only these keys may be written from the admin UI. */
const ALLOWED = new Set([
  "site_title_en",
  "site_title_ar",
  "site_desc_en",
  "site_desc_ar",
  "maintenance",
  "maintenance_note",
]);

async function guard() {
  const env = (await getEnv()) as AdminEnv;
  if (!env.ADMIN_SESSION_SECRET) return { error: "not_configured" as const };
  const jar = await cookies();
  const ok = await isAuthenticated(jar.get(ADMIN_COOKIE)?.value, env);
  if (!ok) return { error: "unauthorized" as const };
  return { env };
}

export async function GET() {
  const auth = await guard();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "unauthorized" ? 401 : 503 });
  }

  const db = auth.env.CONTACT_DB;
  if (!db) return NextResponse.json({ settings: {} });

  try {
    const rows = await db.prepare(`SELECT key, value FROM site_settings`).all<{
      key: string;
      value: string | null;
    }>();

    const settings: Record<string, string> = {};
    for (const row of rows.results ?? []) settings[row.key] = row.value ?? "";
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "query_failed" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await guard();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "unauthorized" ? 401 : 503 });
  }

  const db = auth.env.CONTACT_DB;
  if (!db) return NextResponse.json({ error: "no_database" }, { status: 503 });

  let incoming: Record<string, unknown>;
  try {
    incoming = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const entries = Object.entries(incoming).filter(([key]) => ALLOWED.has(key));
  if (entries.length === 0) return NextResponse.json({ error: "no_valid_keys" }, { status: 400 });

  try {
    await db.batch(
      entries.map(([key, value]) => {
        // "0" and "false" are truthy strings, so an off toggle must be
        // normalised explicitly rather than relying on coercion.
        const isOff = value === false || value === "0" || value === "false" || value === "";
        const normalised = key === "maintenance" ? (isOff ? "0" : "1") : String(value ?? "").slice(0, 400);
        return db
          .prepare(
            `INSERT INTO site_settings (key, value) VALUES (?1, ?2)
             ON CONFLICT(key) DO UPDATE SET
               value = excluded.value,
               updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')`,
          )
          .bind(key, normalised);
      }),
    );
    return NextResponse.json({ ok: true, updated: entries.length });
  } catch {
    return NextResponse.json({ error: "write_failed" }, { status: 500 });
  }
}