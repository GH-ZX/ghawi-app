import { cookies } from "next/headers";
import { ADMIN_COOKIE, type AdminEnv, getEnv, isAuthenticated } from "@/lib/admin-server";
import {
  coordsFromMapUrl,
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
    if (!row) return DEFAULT_CONFIG;
    const config = sanitizeConfig(JSON.parse(row.value));
    // A map link saved before maps were drawn: look its point up once and keep it.
    const missing = Object.values(config.events).some((e) => e.mapUrl && !e.mapCoords);
    if (!missing) return config;
    const filled = await withMapCoords(config);
    if (Object.values(filled.events).some((e, i) => e.mapCoords !== Object.values(config.events)[i].mapCoords)) {
      await db.prepare(`UPDATE invite_settings SET value = ?1 WHERE key = 'config'`).bind(JSON.stringify(filled)).run();
    }
    return filled;
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

/** The photos a link may see on one page ("invite" or "ended"), in the admin's order. */
export async function loadPhotos(db: D1Database | null, audiences: PhotoAudience[], page: "invite" | "ended"): Promise<InvitePhoto[]> {
  if (!db || audiences.length === 0) return [];
  try {
    const marks = audiences.map((_, i) => `?${i + 2}`).join(", ");
    const rows = await db
      .prepare(
        `SELECT id, width, height, caption, audience FROM invite_photos
         WHERE placement IN (?1, 'both') AND audience IN (${marks})
         ORDER BY sort, created_at`,
      )
      .bind(page, ...audiences)
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

export type InviteSong = { version: string; type: string; name: string; size: number };

export const songKey = (version: string) => `song/${version}`;

/** The uploaded song (a video whose sound plays under the invitation), or null. */
export async function loadSong(db: D1Database | null): Promise<InviteSong | null> {
  if (!db) return null;
  try {
    const row = await db.prepare(`SELECT value FROM invite_settings WHERE key = 'song'`).first<{ value: string }>();
    return row ? (JSON.parse(row.value) as InviteSong) : null;
  } catch {
    return null;
  }
}

/**
 * Coordinates for a map link: read straight from it, or from where a short
 * link (maps.app.goo.gl) redirects to.
 */
export async function resolveMapCoords(url: string): Promise<string> {
  if (!url) return "";
  const direct = coordsFromMapUrl(url);
  if (direct) return direct;
  let next = url;
  for (let hop = 0; hop < 4; hop++) {
    try {
      const response = await fetch(next, { redirect: "manual", signal: AbortSignal.timeout(4000) });
      const location = response.headers.get("Location");
      if (!location) return "";
      next = new URL(location, next).toString();
      const found = coordsFromMapUrl(next);
      if (found) return found;
    } catch {
      return "";
    }
  }
  return "";
}

/** Fills mapCoords for any event whose link has none yet. */
export async function withMapCoords(config: InviteConfig): Promise<InviteConfig> {
  const keys = Object.keys(config.events) as (keyof InviteConfig["events"])[];
  const events = { ...config.events };
  await Promise.all(
    keys.map(async (key) => {
      const event = events[key];
      if (event.mapUrl && !event.mapCoords) events[key] = { ...event, mapCoords: await resolveMapCoords(event.mapUrl) };
      if (!event.mapUrl && event.mapCoords) events[key] = { ...event, mapCoords: "" };
    }),
  )
  return { ...config, events };
}
