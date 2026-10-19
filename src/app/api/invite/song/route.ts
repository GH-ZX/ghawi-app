import { inviteDb, loadSong, photosBucket, songKey } from "@/lib/invite-server";

export const dynamic = "force-dynamic";

const notFound = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

/**
 * The song under the invitation: /api/invite/song?v=<version>. Byte ranges
 * are honoured, since browsers fetch media in pieces (Safari insists).
 * Each version is its own R2 object, so it can be cached for good.
 */
export async function GET(request: Request) {
  const [db, bucket] = await Promise.all([inviteDb(), photosBucket()]);
  const song = await loadSong(db);
  if (!song || !bucket) return notFound();
  const v = new URL(request.url).searchParams.get("v");
  if (v && v !== song.version) return notFound();

  const object = await bucket.get(songKey(song.version), { range: request.headers });
  if (!object || !("body" in object)) return notFound();

  const headers = new Headers({
    "Content-Type": song.type,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  });
  const range = object.range as { offset?: number; length?: number } | undefined;
  if (request.headers.has("Range") && range) {
    const offset = range.offset ?? 0;
    const length = range.length ?? object.size - offset;
    headers.set("Content-Range", `bytes ${offset}-${offset + length - 1}/${object.size}`);
    headers.set("Content-Length", String(length));
    return new Response(object.body, { status: 206, headers });
  }
  headers.set("Content-Length", String(object.size));
  return new Response(object.body, { headers });
}
