import { NextResponse } from "next/server";
import { sanitizeConfig } from "@/lib/invite";
import { loadConfig, logoVersion, requireAdminDb } from "@/lib/invite-server";

/* Admin → Invitation → Settings: the whole invitation as one JSON document in D1. */

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  const auth = await requireAdminDb();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status, headers: noStore });
  const [config, logo] = await Promise.all([loadConfig(auth.db), logoVersion(auth.db)]);
  return NextResponse.json({ config, logo }, { headers: noStore });
}

export async function PUT(request: Request) {
  const auth = await requireAdminDb();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status, headers: noStore });

  let input: unknown;
  try {
    input = ((await request.json()) as { config?: unknown }).config;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400, headers: noStore });
  }

  // Whatever arrives is reshaped into a valid config; the page never sees junk.
  const config = sanitizeConfig(input);
  try {
    await auth.db
      .prepare(
        `INSERT INTO invite_settings (key, value) VALUES ('config', ?1)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value,
           updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')`,
      )
      .bind(JSON.stringify(config))
      .run();
    return NextResponse.json({ ok: true, config }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: "write_failed" }, { status: 500, headers: noStore });
  }
}
