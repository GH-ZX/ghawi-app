import { NextResponse } from "next/server";
import { loadSong, photosBucket, requireAdminDb, songKey, type InviteSong } from "@/lib/invite-server";

/*
 * Admin → Invitation → Song: a video (or audio file) whose sound plays under
 * the invitation. The file goes to R2 as-is; D1 keeps which one is current.
 */

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };
const TYPES = /^(?:video\/(?:mp4|quicktime|webm)|audio\/(?:mpeg|mp4|x-m4a|aac|ogg|wav|webm))$/;
/** Read into memory whole, so kept well under the Worker's 128 MB. */
const MAX_BYTES = 60 * 1024 * 1024;

const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers: noStore });

export async function GET() {
  const auth = await requireAdminDb();
  if ("error" in auth) return fail(auth.error, auth.status);
  return NextResponse.json({ song: await loadSong(auth.db) }, { headers: noStore });
}

/** The raw file is the body; its name rides in ?name=. */
export async function PUT(request: Request) {
  const auth = await requireAdminDb();
  if ("error" in auth) return fail(auth.error, auth.status);
  const bucket = await photosBucket();
  if (!bucket) return fail("no_storage", 503);

  const type = (request.headers.get("Content-Type") ?? "").split(";")[0].trim().toLowerCase();
  if (!TYPES.test(type)) return fail("bad_type", 400);
  const declared = Number(request.headers.get("Content-Length"));
  if (Number.isFinite(declared) && declared > MAX_BYTES) return fail("too_large", 413);
  // Read whole: the body's length isn't always known to the Worker, and R2 needs it.
  let bytes: ArrayBuffer;
  try {
    bytes = await request.arrayBuffer();
  } catch {
    return fail("read_failed", 400);
  }
  const size = bytes.byteLength;
  if (size === 0) return fail("empty", 400);
  if (size > MAX_BYTES) return fail("too_large", 413);

  const previous = await loadSong(auth.db);
  const version = new Date().toISOString().replace(/[^0-9]/g, "");
  const name = (new URL(request.url).searchParams.get("name") ?? "").slice(0, 120);
  try {
    await bucket.put(songKey(version), bytes, { httpMetadata: { contentType: type } });
    const song: InviteSong = { version, type, name, size };
    await auth.db
      .prepare(
        `INSERT INTO invite_settings (key, value, updated_at) VALUES ('song', ?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      )
      .bind(JSON.stringify(song), new Date().toISOString())
      .run();
    if (previous) await bucket.delete(songKey(previous.version)).catch(() => undefined);
    return NextResponse.json({ ok: true, song }, { headers: noStore });
  } catch {
    return fail("write_failed", 500);
  }
}

export async function DELETE() {
  const auth = await requireAdminDb();
  if ("error" in auth) return fail(auth.error, auth.status);
  const [song, bucket] = await Promise.all([loadSong(auth.db), photosBucket()]);
  try {
    await auth.db.prepare(`DELETE FROM invite_settings WHERE key = 'song'`).run();
    if (song && bucket) await bucket.delete(songKey(song.version)).catch(() => undefined);
    return NextResponse.json({ ok: true, song: null }, { headers: noStore });
  } catch {
    return fail("delete_failed", 500);
  }
}
