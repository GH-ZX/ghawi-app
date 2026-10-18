import { NextResponse } from "next/server";
import { isGuestSlug } from "@/lib/invite";
import { inviteDb } from "@/lib/invite-server";

export const dynamic = "force-dynamic";

/**
 * A guest opened their link: the page sends one beacon per browser session.
 * Bots that only fetch link previews run no script, so they never count.
 */
export async function POST(request: Request) {
  let slug: unknown;
  try {
    slug = ((await request.json()) as { slug?: unknown }).slug;
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  const db = await inviteDb();
  if (!db || !isGuestSlug(slug)) return new NextResponse(null, { status: 204 });

  try {
    const now = new Date().toISOString();
    await db
      .prepare(
        `UPDATE invite_guests
         SET open_count = open_count + 1, last_open = ?2, first_open = COALESCE(first_open, ?2)
         WHERE slug = ?1`,
      )
      .bind(slug, now)
      .run();
  } catch {
    /* counting is best-effort */
  }
  return new NextResponse(null, { status: 204 });
}
