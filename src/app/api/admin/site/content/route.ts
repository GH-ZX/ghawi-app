import { NextResponse } from "next/server";
import { DEFAULT_CONTENT } from "@/lib/content";
import { requireAdminDb } from "@/lib/invite-server";
import { sanitizeContent } from "@/lib/site-content";
import { CONTENT_KEY, loadContent, saveContent } from "@/lib/site-server";
import { storeProducts } from "@/lib/theme";

/*
 * Admin → Site: every word and link on ghawi.app/en and /ar, as one JSON
 * document in D1. Saved edits are live within 30 seconds (worker.ts).
 */

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers: noStore });

export async function GET() {
  const auth = await requireAdminDb();
  if ("error" in auth) return fail(auth.error, auth.status);
  const { content, updatedAt } = await loadContent(auth.db);
  return NextResponse.json({ content, defaults: DEFAULT_CONTENT, updatedAt, products: storeProducts }, { headers: noStore });
}

export async function PUT(request: Request) {
  const auth = await requireAdminDb();
  if ("error" in auth) return fail(auth.error, auth.status);

  let input: unknown;
  try {
    input = ((await request.json()) as { content?: unknown }).content;
  } catch {
    return fail("invalid_json", 400);
  }

  // Whatever arrives is reshaped to the defaults; the page never sees junk.
  const content = sanitizeContent(input);
  try {
    await saveContent(auth.db, content);
    const saved = await loadContent(auth.db);
    return NextResponse.json({ ok: true, content: saved.content, updatedAt: saved.updatedAt }, { headers: noStore });
  } catch {
    return fail("write_failed", 500);
  }
}

/** Back to the defaults in src/lib/content.ts. */
export async function DELETE() {
  const auth = await requireAdminDb();
  if ("error" in auth) return fail(auth.error, auth.status);
  try {
    await auth.db.prepare(`DELETE FROM site_settings WHERE key = ?1`).bind(CONTENT_KEY).run();
    return NextResponse.json({ ok: true, content: DEFAULT_CONTENT, updatedAt: null }, { headers: noStore });
  } catch {
    return fail("delete_failed", 500);
  }
}
