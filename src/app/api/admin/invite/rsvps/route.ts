import { NextResponse } from "next/server";
import { requireAdminDb } from "@/lib/invite-server";

/* Remove one reply: a stray one on the general link, or a guest's, so they can answer afresh. */

export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
  const auth = await requireAdminDb();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "bad_id" }, { status: 400 });
  try {
    await auth.db.prepare(`DELETE FROM invite_rsvps WHERE id = ?1`).bind(id).run();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
