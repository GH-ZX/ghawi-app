import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, type AdminEnv, getEnv, isAuthenticated } from "@/lib/admin-server";
import { isSiteThemeChoice } from "@/lib/classic-themes";

/*
 * The landing page's theme, as picked in the admin. Stored in D1
 * (`site_settings.site_theme`) and applied at the edge by worker.ts.
 * "ghstore" — the default — follows GH Store's own look.
 */

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

async function guard() {
  const env = ((await getEnv()) ?? {}) as AdminEnv;
  if (!env.ADMIN_SESSION_SECRET) return { error: "not_configured" as const, status: 503 };
  const jar = await cookies();
  if (!(await isAuthenticated(jar.get(ADMIN_COOKIE)?.value, env))) return { error: "unauthorized" as const, status: 401 };
  if (!env.CONTACT_DB) return { error: "no_database" as const, status: 503 };
  return { db: env.CONTACT_DB };
}

export async function GET() {
  const auth = await guard();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status, headers: noStore });

  try {
    const row = await auth.db
      .prepare(`SELECT value, updated_at FROM site_settings WHERE key = 'site_theme'`)
      .first<{ value: string | null; updated_at: string }>();
    const theme = isSiteThemeChoice(row?.value) ? row.value : "ghstore";
    return NextResponse.json({ theme, updatedAt: row?.updated_at ?? null }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: "query_failed" }, { status: 500, headers: noStore });
  }
}

export async function PUT(request: Request) {
  const auth = await guard();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status, headers: noStore });

  let theme: unknown;
  try {
    theme = ((await request.json()) as { theme?: unknown }).theme;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400, headers: noStore });
  }
  // Never store a value the edge would ignore: the admin would think it applied.
  if (!isSiteThemeChoice(theme)) return NextResponse.json({ error: "unknown_theme" }, { status: 400, headers: noStore });

  try {
    await auth.db
      .prepare(
        `INSERT INTO site_settings (key, value) VALUES ('site_theme', ?1)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value,
           updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')`,
      )
      .bind(theme)
      .run();
    return NextResponse.json({ ok: true, theme }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: "write_failed" }, { status: 500, headers: noStore });
  }
}
