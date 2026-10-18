import { cookies } from "next/headers";
import { ADMIN_COOKIE, type AdminEnv, getEnv, isAuthenticated } from "@/lib/admin-server";
import {
  DEFAULT_CONFIG,
  isInviteTheme,
  isParties,
  isPhotoAudience,
  type InvitePhoto,
  type PhotoAudience,
  sanitizeConfig,
  type InviteConfig,
  type InviteGuest,
  type InviteRsvp,
} from "@/lib/invite";

/*
 * D1 access for the invitation. The invitation shares the site's database
 * (CONTACT_DB); its tables are created by migrations/0004_invite.sql.
 */

export async function inviteDb(): Promise<D1Database | null> {
  const env = ((await getEnv()) ?? {}) as AdminEnv;
  return env.CONTACT_DB ?? null;
}

export async function loadConfig(db: D1Database | null): Promise<InviteConfig> {
  if (!db) return DEFAULT_CONFIG;
  try {
    const row = await db.prepare(`SELECT value FROM invite_settings WHERE key = 'config'`).first<{ value: string }>();
    return row ? sanitizeConfig(JSON.parse(row.value)) : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

/** The uploaded logo's version (its save time), or null for the drawn monogram. */
export async function logoVersion(db: D1Database | null): Promise<string | null> {
  if (!db) return null;
  try {
    const row = await db.prepare(`SELECT updated_at FROM invite_settings WHERE key = 'logo'`).first<{ updated_at: string }>();
    return row?.updated_at ?? null;
  } catch {
    return null;
  }
}

export type GuestRow = {
  id: number;
  slug: string;
  name: string;
  honorific: string;
  parties: string;
  seats: number;
  theme: string | null;
  note: string;
};

export function toGuest(row: GuestRow): InviteGuest {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    honorific: row.honorific,
    parties: isParties(row.parties) ? row.parties : "both",
    seats: row.seats,
    theme: isInviteTheme(row.theme) ? row.theme : null,
    note: row.note,
  };
}

export async function loadGuest(db: D1Database | null, slug: string): Promise<InviteGuest | null> {
  if (!db) return null;
  try {
    const row = await db
      .prepare(`SELECT id, slug, name, honorific, parties, seats, theme, note FROM invite_guests WHERE slug = ?1`)
      .bind(slug)
      .first<GuestRow>();
    return row ? toGuest(row) : null;
  } catch {
    return null;
  }
}

export async function loadRsvp(db: D1Database | null, guestId: number): Promise<InviteRsvp | null> {
  if (!db) return null;
  try {
    const row = await db
      .prepare(`SELECT name, attending, men, women, message FROM invite_rsvps WHERE guest_id = ?1`)
      .bind(guestId)
      .first<{ name: string; attending: number; men: number; women: number; message: string }>();
    return row ? { ...row, attending: row.attending === 1 } : null;
  } catch {
    return null;
  }
}

/** For the admin's invitation routes: a signed-in session and a database, or an error response shape. */
export async function requireAdminDb(): Promise<{ db: D1Database } | { error: string; status: number }> {
  const env = ((await getEnv()) ?? {}) as AdminEnv;
  if (!env.ADMIN_SESSION_SECRET) return { error: "not_configured", status: 503 };
  const jar = await cookies();
  if (!(await isAuthenticated(jar.get(ADMIN_COOKIE)?.value, env))) return { error: "unauthorized", status: 401 };
  if (!env.CONTACT_DB) return { error: "no_database", status: 503 };
  return { db: env.CONTACT_DB };
}

/* ------------------------------------------------------------------ *
 *  Wedding photos — rows in D1, files in R2 (INVITE_PHOTOS)
 * ------------------------------------------------------------------ */

export async function photosBucket(): Promise<R2Bucket | null> {
  const env = ((await getEnv()) ?? {}) as { INVITE_PHOTOS?: R2Bucket };
  return env.INVITE_PHOTOS ?? null;
}

export const photoKey = (id: string, size: "full" | "thumb") => `photos/${id}/${size}`;

type PhotoRow = { id: string; width: number; height: number; caption: string; audience: string };

/** The photos a link may see, in the admin's order. */
export async function loadPhotos(db: D1Database | null, audiences: PhotoAudience[]): Promise<InvitePhoto[]> {
  if (!db || audiences.length === 0) return [];
  try {
    const marks = audiences.map((_, i) => `?${i + 1}`).join(", ");
    const rows = await db
      .prepare(`SELECT id, width, height, caption, audience FROM invite_photos WHERE audience IN (${marks}) ORDER BY sort, created_at`)
      .bind(...audiences)
      .all<PhotoRow>();
    return (rows.results ?? []).map((row) => ({ ...row, audience: isPhotoAudience(row.audience) ? row.audience : "all" }));
  } catch {
    return [];
  }
}

/** True when the request carries a valid admin session (admin previews see every photo). */
export async function isAdminSession(): Promise<boolean> {
  const env = ((await getEnv()) ?? {}) as AdminEnv;
  const jar = await cookies();
  return isAuthenticated(jar.get(ADMIN_COOKIE)?.value, env);
}
