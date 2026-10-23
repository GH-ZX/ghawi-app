import { cookies } from "next/headers";
import { ADMIN_COOKIE, type AdminEnv, getEnv, isAuthenticated } from "@/lib/admin-server";
import { BOT_UA, countStatement, LABEL_RE } from "@/lib/events";

/*
 * POST /api/track — the page's beacon (src/components/site/track.tsx).
 * Adds one to today's counters and forgets the request: no cookies set, no
 * IP or user agent stored. The admin's own visits and obvious bots are skipped.
 */

export const dynamic = "force-dynamic";

const done = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (BOT_UA.test(request.headers.get("user-agent") ?? "")) return done();

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return done();
  }
  const kind = body.k === "view" || body.k === "click" ? body.k : null;
  const label = typeof body.l === "string" ? body.l.trim() : "";
  const locale = body.loc === "ar" || body.loc === "en" ? body.loc : "";
  if (!kind || !LABEL_RE.test(label)) return done();
  // Views are of this site's pages only; anything else is noise or mischief.
  if (kind === "view" && !/^\/(en|ar)(\/[a-z0-9/-]*)?$/.test(label)) return done();

  const env = ((await getEnv()) ?? {}) as AdminEnv;
  const db = env.CONTACT_DB;
  if (!db) return done();

  const jar = await cookies();
  if (await isAuthenticated(jar.get(ADMIN_COOKIE)?.value, env)) return done();

  const statements = [countStatement(db, kind, label, locale)];
  if (kind === "view") {
    const ref = typeof body.r === "string" ? body.r.trim().toLowerCase().replace(/^www\./, "") : "";
    if (ref && LABEL_RE.test(ref)) statements.push(countStatement(db, "ref", ref));
    const country = (request.headers.get("cf-ipcountry") ?? "").toUpperCase();
    if (/^[A-Z]{2}$/.test(country) && country !== "XX") statements.push(countStatement(db, "country", country));
  }

  try {
    await db.batch(statements);
  } catch (error) {
    console.error("[track] count failed", error);
  }
  return done();
}
