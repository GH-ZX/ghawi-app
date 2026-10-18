import { GENERAL_SLUG, isGuestSlug, partiesOf, type PartyKey } from "@/lib/invite";
import { inviteDb, isAdminSession, loadGuest, photoKey, photosBucket } from "@/lib/invite-server";

export const dynamic = "force-dynamic";

const ID = /^[a-f0-9-]{36}$/;
const notFound = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

/**
 * One wedding photo: /api/invite/photo/<id>?s=thumb|full&slug=<link>.
 * A photo for one party's guests only is served to a link invited to that
 * party (or to the signed-in admin); anyone else gets a 404, as if it
 * didn't exist.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ID.test(id)) return notFound();
  const url = new URL(request.url);
  const size = url.searchParams.get("s") === "full" ? "full" : "thumb";
  const slug = url.searchParams.get("slug") ?? "";

  const [db, bucket] = await Promise.all([inviteDb(), photosBucket()]);
  if (!db || !bucket) return notFound();

  const row = await db
    .prepare(`SELECT audience, full_type, thumb_type FROM invite_photos WHERE id = ?1`)
    .bind(id)
    .first<{ audience: string; full_type: string; thumb_type: string }>()
    .catch(() => null);
  if (!row) return notFound();

  const open = row.audience === "all";
  if (!open) {
    let allowed = await isAdminSession();
    if (!allowed && slug !== GENERAL_SLUG && isGuestSlug(slug)) {
      const guest = await loadGuest(db, slug);
      allowed = Boolean(guest && partiesOf(guest.parties).includes(row.audience as PartyKey));
    }
    if (!allowed) return notFound();
  }

  const object = await bucket.get(photoKey(id, size));
  if (!object) return notFound();
  return new Response(object.body, {
    headers: {
      "Content-Type": size === "full" ? row.full_type : row.thumb_type,
      // Private, and short: if the admin narrows a photo's audience or deletes
      // it, no shared cache keeps serving it and browsers let go within the hour.
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
