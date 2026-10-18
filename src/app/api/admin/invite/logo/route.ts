import { NextResponse } from "next/server";
import { requireAdminDb } from "@/lib/invite-server";

/* Admin → Invitation → Logo: upload a logo to replace the couple's mark, or remove it. */

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };
const DATA_URL = /^data:image\/(?:png|jpeg|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/;
/** ~600 KB of image; D1 rows stay well under their limit. */
const MAX_CHARS = 820_000;

export async function PUT(request: Request) {
  const auth = await requireAdminDb();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status, headers: noStore });

  let dataUrl: unknown;
  try {
    dataUrl = ((await request.json()) as { dataUrl?: unknown }).dataUrl;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400, headers: noStore });
  }
  if (typeof dataUrl !== "string" || !DATA_URL.test(dataUrl)) {
    return NextResponse.json({ error: "bad_image" }, { status: 400, headers: noStore });
  }
  if (dataUrl.length > MAX_CHARS) return NextResponse.json({ error: "too_large" }, { status: 413, headers: noStore });

  try {
    const version = new Date().toISOString();
    await auth.db
      .prepare(
        `INSERT INTO invite_settings (key, value, updated_at) VALUES ('logo', ?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      )
      .bind(dataUrl, version)
      .run();
    return NextResponse.json({ ok: true, logo: version }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: "write_failed" }, { status: 500, headers: noStore });
  }
}

export async function DELETE() {
  const auth = await requireAdminDb();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status, headers: noStore });
  try {
    await auth.db.prepare(`DELETE FROM invite_settings WHERE key = 'logo'`).run();
    return NextResponse.json({ ok: true, logo: null }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: "delete_failed" }, { status: 500, headers: noStore });
  }
}
