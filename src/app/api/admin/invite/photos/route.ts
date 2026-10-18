import { NextResponse } from "next/server";
import { isPhotoAudience, isPhotoPlacement } from "@/lib/invite";
import { photoKey, photosBucket, requireAdminDb } from "@/lib/invite-server";

/*
 * Admin → Invitation → Photos. The browser resizes each photo before
 * sending it (a full size and a thumbnail), so the Worker only checks and
 * stores: files in R2, one row per photo in D1.
 */

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };
const fail = (error: string, status = 400) => NextResponse.json({ error }, { status, headers: noStore });
const TYPES = new Set(["image/webp", "image/jpeg"]);
const MAX_FULL = 8 * 1024 * 1024;
const MAX_THUMB = 1024 * 1024;
const ID = /^[a-f0-9-]{36}$/;

async function guard() {
  const auth = await requireAdminDb();
  if ("error" in auth) return auth;
  const bucket = await photosBucket();
  if (!bucket) return { error: "no_bucket", status: 503 };
  return { db: auth.db, bucket };
}

export async function GET() {
  const auth = await guard();
  if ("error" in auth) return fail(auth.error, auth.status);
  try {
    const rows = await auth.db
      .prepare(`SELECT id, width, height, caption, audience, placement, sort, created_at FROM invite_photos ORDER BY sort, created_at`)
      .all();
    return NextResponse.json({ photos: rows.results ?? [] }, { headers: noStore });
  } catch {
    return fail("query_failed", 500);
  }
}

export async function POST(request: Request) {
  const auth = await guard();
  if ("error" in auth) return fail(auth.error, auth.status);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("bad_form");
  }
  const full = form.get("full");
  const thumb = form.get("thumb");
  const width = Number(form.get("width"));
  const height = Number(form.get("height"));
  const audience = form.get("audience");
  const placement = form.get("placement") ?? "both";
  const caption = String(form.get("caption") ?? "").trim().slice(0, 200);

  if (!(full instanceof File) || !(thumb instanceof File)) return fail("missing_file");
  if (!TYPES.has(full.type) || !TYPES.has(thumb.type)) return fail("bad_type");
  if (full.size > MAX_FULL || thumb.size > MAX_THUMB) return fail("too_large", 413);
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 10000 || height > 10000) return fail("bad_size");
  if (!isPhotoAudience(audience)) return fail("bad_audience");
  if (!isPhotoPlacement(placement)) return fail("bad_placement");

  const id = crypto.randomUUID();
  try {
    await Promise.all([
      auth.bucket.put(photoKey(id, "full"), await full.arrayBuffer(), { httpMetadata: { contentType: full.type } }),
      auth.bucket.put(photoKey(id, "thumb"), await thumb.arrayBuffer(), { httpMetadata: { contentType: thumb.type } }),
    ]);
    await auth.db
      .prepare(
        `INSERT INTO invite_photos (id, width, height, full_type, thumb_type, caption, audience, placement, sort)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, (SELECT COALESCE(MAX(sort), 0) + 1 FROM invite_photos))`,
      )
      .bind(id, width, height, full.type, thumb.type, caption, audience, placement)
      .run();
    return NextResponse.json({ ok: true, id }, { headers: noStore });
  } catch {
    // Don't leave files without a row.
    await auth.bucket.delete([photoKey(id, "full"), photoKey(id, "thumb")]).catch(() => {});
    return fail("write_failed", 500);
  }
}

/** Edit one photo ({ id, caption?, audience?, placement? }) or set the order ({ order: [id, …] }). */
export async function PATCH(request: Request) {
  const auth = await guard();
  if ("error" in auth) return fail(auth.error, auth.status);
  let body: { id?: unknown; caption?: unknown; audience?: unknown; placement?: unknown; order?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return fail("invalid_json");
  }

  try {
    if (Array.isArray(body.order)) {
      const ids = body.order.filter((id): id is string => typeof id === "string" && ID.test(id)).slice(0, 500);
      await auth.db.batch(ids.map((id, i) => auth.db.prepare(`UPDATE invite_photos SET sort = ?1 WHERE id = ?2`).bind(i + 1, id)));
      return NextResponse.json({ ok: true }, { headers: noStore });
    }
    if (typeof body.id !== "string" || !ID.test(body.id)) return fail("bad_id");
    if (body.audience !== undefined && !isPhotoAudience(body.audience)) return fail("bad_audience");
    if (body.placement !== undefined && !isPhotoPlacement(body.placement)) return fail("bad_placement");
    await auth.db
      .prepare(
        `UPDATE invite_photos SET caption = COALESCE(?1, caption), audience = COALESCE(?2, audience),
           placement = COALESCE(?3, placement) WHERE id = ?4`,
      )
      .bind(typeof body.caption === "string" ? body.caption.trim().slice(0, 200) : null, body.audience ?? null, body.placement ?? null, body.id)
      .run();
    return NextResponse.json({ ok: true }, { headers: noStore });
  } catch {
    return fail("write_failed", 500);
  }
}

export async function DELETE(request: Request) {
  const auth = await guard();
  if ("error" in auth) return fail(auth.error, auth.status);
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!ID.test(id)) return fail("bad_id");
  try {
    await auth.db.prepare(`DELETE FROM invite_photos WHERE id = ?1`).bind(id).run();
    await auth.bucket.delete([photoKey(id, "full"), photoKey(id, "thumb")]);
    return NextResponse.json({ ok: true }, { headers: noStore });
  } catch {
    return fail("delete_failed", 500);
  }
}
