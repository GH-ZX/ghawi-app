import { NextResponse } from "next/server";
import { requireAdminDb } from "@/lib/invite-server";
import { isFileKey, listFiles } from "@/lib/site-server";

/*
 * Admin → Site → CV: the PDF behind "Download PDF", one per language. Without
 * an upload the button serves the PDF bundled with the site (public/media/cv).
 */

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers: noStore });

/** D1 keeps a row under 2 MB; a CV is a fraction of that. */
const MAX_BYTES = 1_800_000;

export async function GET() {
  const auth = await requireAdminDb();
  if ("error" in auth) return fail(auth.error, auth.status);
  try {
    return NextResponse.json({ files: await listFiles(auth.db) }, { headers: noStore });
  } catch {
    return fail("query_failed", 500);
  }
}

/** The raw PDF is the body; ?key=cv-en|cv-ar says which, ?name= its file name. */
export async function PUT(request: Request) {
  const auth = await requireAdminDb();
  if ("error" in auth) return fail(auth.error, auth.status);

  const params = new URL(request.url).searchParams;
  const key = params.get("key");
  if (!isFileKey(key)) return fail("bad_key", 400);
  const type = (request.headers.get("Content-Type") ?? "").split(";")[0].trim().toLowerCase();
  if (type !== "application/pdf") return fail("bad_type", 400);
  const declared = Number(request.headers.get("Content-Length"));
  if (Number.isFinite(declared) && declared > MAX_BYTES) return fail("too_large", 413);

  let bytes: ArrayBuffer;
  try {
    bytes = await request.arrayBuffer();
  } catch {
    return fail("read_failed", 400);
  }
  if (bytes.byteLength === 0) return fail("empty", 400);
  if (bytes.byteLength > MAX_BYTES) return fail("too_large", 413);
  // "%PDF" — a renamed image is not a CV.
  const head = new Uint8Array(bytes, 0, 4);
  if (String.fromCharCode(...head) !== "%PDF") return fail("bad_type", 400);

  const name = (params.get("name") ?? "").replace(/[^\w.\- ]+/g, "").slice(0, 120);
  try {
    await auth.db
      .prepare(
        `INSERT INTO site_files (key, type, name, size, data) VALUES (?1, ?2, ?3, ?4, ?5)
         ON CONFLICT(key) DO UPDATE SET type = excluded.type, name = excluded.name, size = excluded.size,
           data = excluded.data, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')`,
      )
      .bind(key, type, name, bytes.byteLength, bytes)
      .run();
    return NextResponse.json({ ok: true, files: await listFiles(auth.db) }, { headers: noStore });
  } catch {
    return fail("write_failed", 500);
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdminDb();
  if ("error" in auth) return fail(auth.error, auth.status);
  const key = new URL(request.url).searchParams.get("key");
  if (!isFileKey(key)) return fail("bad_key", 400);
  try {
    await auth.db.prepare(`DELETE FROM site_files WHERE key = ?1`).bind(key).run();
    return NextResponse.json({ ok: true, files: await listFiles(auth.db) }, { headers: noStore });
  } catch {
    return fail("delete_failed", 500);
  }
}
