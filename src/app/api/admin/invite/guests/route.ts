import { NextResponse } from "next/server";
import { isGuestSlug, isInviteTheme, isParties } from "@/lib/invite";
import { requireAdminDb } from "@/lib/invite-server";

/*
 * Admin → Invitation → Guests: everyone with a personal link, how often
 * they opened it, and their reply; plus the replies from the general link.
 */

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };
const fail = (error: string, status = 400) => NextResponse.json({ error }, { status, headers: noStore });

type GuestInput = {
  id?: unknown;
  slug?: unknown;
  name?: unknown;
  honorific?: unknown;
  parties?: unknown;
  seats?: unknown;
  theme?: unknown;
  note?: unknown;
};

type CleanGuest = { slug: string; name: string; honorific: string; parties: string; seats: number; theme: string | null; note: string };

function clean(input: GuestInput): CleanGuest | string {
  const slug = typeof input.slug === "string" ? input.slug.trim().toLowerCase() : "";
  if (!isGuestSlug(slug)) return "bad_slug";
  const name = typeof input.name === "string" ? input.name.trim().slice(0, 80) : "";
  if (!name) return "need_name";
  const seats = Number(input.seats);
  if (!Number.isInteger(seats) || seats < 1 || seats > 30) return "bad_seats";
  if (!isParties(input.parties)) return "bad_parties";
  return {
    slug,
    name,
    honorific: typeof input.honorific === "string" ? input.honorific.trim().slice(0, 30) : "",
    parties: input.parties,
    seats,
    theme: isInviteTheme(input.theme) ? input.theme : null,
    note: typeof input.note === "string" ? input.note.trim().slice(0, 300) : "",
  };
}

async function read(request: Request): Promise<GuestInput | null> {
  try {
    return (await request.json()) as GuestInput;
  } catch {
    return null;
  }
}

export async function GET() {
  const auth = await requireAdminDb();
  if ("error" in auth) return fail(auth.error, auth.status);

  try {
    const [guests, general] = await Promise.all([
      auth.db
        .prepare(
          `SELECT g.id, g.slug, g.name, g.honorific, g.parties, g.seats, g.theme, g.note, g.created_at,
                  g.first_open, g.last_open, g.open_count,
                  r.id AS rsvp_id, r.attending, r.men, r.women, r.message, r.updated_at AS replied_at
           FROM invite_guests g
           LEFT JOIN invite_rsvps r ON r.guest_id = g.id
           ORDER BY g.id DESC`,
        )
        .all(),
      auth.db
        .prepare(
          `SELECT id, name, attending, men, women, message, created_at
           FROM invite_rsvps WHERE guest_id IS NULL ORDER BY id DESC LIMIT 500`,
        )
        .all(),
    ]);
    return NextResponse.json({ guests: guests.results ?? [], general: general.results ?? [] }, { headers: noStore });
  } catch {
    return fail("query_failed", 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminDb();
  if ("error" in auth) return fail(auth.error, auth.status);
  const input = await read(request);
  if (!input) return fail("invalid_json");
  const guest = clean(input);
  if (typeof guest === "string") return fail(guest);

  try {
    const row = await auth.db
      .prepare(
        `INSERT INTO invite_guests (slug, name, honorific, parties, seats, theme, note)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7) RETURNING id`,
      )
      .bind(guest.slug, guest.name, guest.honorific, guest.parties, guest.seats, guest.theme, guest.note)
      .first<{ id: number }>();
    return NextResponse.json({ ok: true, id: row?.id }, { headers: noStore });
  } catch (error) {
    return String(error).includes("UNIQUE") ? fail("slug_taken", 409) : fail("write_failed", 500);
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdminDb();
  if ("error" in auth) return fail(auth.error, auth.status);
  const input = await read(request);
  if (!input) return fail("invalid_json");
  const id = Number(input.id);
  if (!Number.isInteger(id) || id < 1) return fail("bad_id");
  const guest = clean(input);
  if (typeof guest === "string") return fail(guest);

  try {
    await auth.db
      .prepare(
        `UPDATE invite_guests SET slug = ?1, name = ?2, honorific = ?3, parties = ?4, seats = ?5, theme = ?6, note = ?7
         WHERE id = ?8`,
      )
      .bind(guest.slug, guest.name, guest.honorific, guest.parties, guest.seats, guest.theme, guest.note, id)
      .run();
    return NextResponse.json({ ok: true }, { headers: noStore });
  } catch (error) {
    return String(error).includes("UNIQUE") ? fail("slug_taken", 409) : fail("write_failed", 500);
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdminDb();
  if ("error" in auth) return fail(auth.error, auth.status);
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id < 1) return fail("bad_id");
  try {
    // D1 enforces foreign keys, but delete the reply explicitly so it never lingers.
    await auth.db.batch([
      auth.db.prepare(`DELETE FROM invite_rsvps WHERE guest_id = ?1`).bind(id),
      auth.db.prepare(`DELETE FROM invite_guests WHERE id = ?1`).bind(id),
    ]);
    return NextResponse.json({ ok: true }, { headers: noStore });
  } catch {
    return fail("delete_failed", 500);
  }
}
