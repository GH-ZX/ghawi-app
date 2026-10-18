import { NextResponse } from "next/server";
import { GENERAL_SLUG, isGuestSlug, partiesOf, rsvpClosed } from "@/lib/invite";
import { inviteDb, loadConfig, loadGuest } from "@/lib/invite-server";
import { clientIp, minutesAgo } from "@/lib/request";

export const dynamic = "force-dynamic";

/** Most people one reply on the general link may bring. */
const GENERAL_SEATS = 10;
/** General-link replies per IP per hour. */
const GENERAL_LIMIT = 8;

type Body = {
  slug?: unknown;
  name?: unknown;
  attending?: unknown;
  men?: unknown;
  women?: unknown;
  message?: unknown;
};

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

const count = (value: unknown) => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 && n <= 30 ? n : -1;
};

/**
 * A reply to the invitation. Named guests have one reply, which they can
 * change until the deadline; the general link records a new one each time.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return fail("invalid_json");
  }

  const db = await inviteDb();
  if (!db) return fail("no_database", 503);

  const config = await loadConfig(db);
  if (rsvpClosed(config)) return fail("closed", 403);

  const slug = body.slug;
  const isGeneral = slug === GENERAL_SLUG;
  if (!isGeneral && !isGuestSlug(slug)) return fail("unknown_invite", 404);
  const guest = isGeneral ? null : await loadGuest(db, slug as string);
  if (!isGeneral && !guest) return fail("unknown_invite", 404);

  const attending = body.attending === true;
  const allowed = guest ? partiesOf(guest.parties) : (["men", "women"] as const);
  let men = count(body.men);
  let women = count(body.women);
  if (men < 0 || women < 0) return fail("bad_count");
  if (!attending) men = women = 0;
  if (!allowed.includes("men")) men = 0;
  if (!allowed.includes("women")) women = 0;
  if (attending && men + women < 1) return fail("need_count");
  if (men + women > (guest ? guest.seats : GENERAL_SEATS)) return fail("too_many");

  const name = guest ? [guest.honorific, guest.name].filter(Boolean).join(" ") : typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
  if (!name) return fail("need_name");
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 400) : "";
  const ip = clientIp(request);
  const now = new Date().toISOString();

  try {
    if (guest) {
      await db
        .prepare(
          `INSERT INTO invite_rsvps (guest_id, name, attending, men, women, message, ip, created_at, updated_at)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?8)
           ON CONFLICT(guest_id) DO UPDATE SET
             name = excluded.name, attending = excluded.attending, men = excluded.men,
             women = excluded.women, message = excluded.message, ip = excluded.ip, updated_at = excluded.updated_at`,
        )
        .bind(guest.id, name, attending ? 1 : 0, men, women, message, ip, now)
        .run();
    } else {
      const recent = await db
        .prepare(`SELECT COUNT(*) AS n FROM invite_rsvps WHERE guest_id IS NULL AND ip = ?1 AND created_at > ?2`)
        .bind(ip, minutesAgo(60))
        .first<{ n: number }>();
      if ((recent?.n ?? 0) >= GENERAL_LIMIT) return fail("rate_limited", 429);
      await db
        .prepare(
          `INSERT INTO invite_rsvps (guest_id, name, attending, men, women, message, ip, created_at, updated_at)
           VALUES (NULL, ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?7)`,
        )
        .bind(name, attending ? 1 : 0, men, women, message, ip, now)
        .run();
    }
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return fail("write_failed", 500);
  }
}
