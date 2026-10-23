import { cache } from "react";
import { type AdminEnv, getEnv } from "@/lib/admin-server";
import { DEFAULT_CONTENT, type SiteContent } from "@/lib/content";
import { sanitizeContent } from "@/lib/site-content";

/*
 * The landing content lives in D1 (`site_settings.site_content`, one JSON
 * document edited from Admin → Site). Pages read it at request time; worker.ts
 * caches the rendered HTML at the edge until the content or the deploy changes.
 */

export const CONTENT_KEY = "site_content";

export async function siteDb(): Promise<D1Database | null> {
  const env = ((await getEnv()) ?? {}) as AdminEnv;
  return env.CONTACT_DB ?? null;
}

export async function loadContent(db: D1Database | null): Promise<{ content: SiteContent; updatedAt: string | null }> {
  if (!db) return { content: DEFAULT_CONTENT, updatedAt: null };
  try {
    const row = await db
      .prepare(`SELECT value, updated_at FROM site_settings WHERE key = ?1`)
      .bind(CONTENT_KEY)
      .first<{ value: string | null; updated_at: string }>();
    if (!row?.value) return { content: DEFAULT_CONTENT, updatedAt: null };
    return { content: sanitizeContent(JSON.parse(row.value)), updatedAt: row.updated_at };
  } catch {
    // Unreadable or unreachable: the defaults are a complete page.
    return { content: DEFAULT_CONTENT, updatedAt: null };
  }
}

/** Once per request, however many components and metadata functions ask. */
export const getSiteContent = cache(async (): Promise<SiteContent> => (await loadContent(await siteDb())).content);

export async function saveContent(db: D1Database, content: SiteContent): Promise<void> {
  await db
    .prepare(
      `INSERT INTO site_settings (key, value) VALUES (?1, ?2)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value,
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')`,
    )
    .bind(CONTENT_KEY, JSON.stringify(content))
    .run();
}

/* ------------------------------------------------------------------ *
 *  Files the admin uploads (the CV PDFs), kept in D1 as blobs
 * ------------------------------------------------------------------ */

export const FILE_KEYS = ["cv-en", "cv-ar"] as const;
export type FileKey = (typeof FILE_KEYS)[number];
export const isFileKey = (value: unknown): value is FileKey => FILE_KEYS.includes(value as FileKey);

export type SiteFile = { key: FileKey; type: string; name: string; size: number; updatedAt: string };

export async function listFiles(db: D1Database): Promise<SiteFile[]> {
  const { results } = await db
    .prepare(`SELECT key, type, name, size, updated_at FROM site_files ORDER BY key`)
    .all<{ key: FileKey; type: string; name: string; size: number; updated_at: string }>();
  return results.map((row) => ({ key: row.key, type: row.type, name: row.name, size: row.size, updatedAt: row.updated_at }));
}

export async function readFile(db: D1Database, key: FileKey): Promise<{ type: string; name: string; data: ArrayBuffer; updatedAt: string } | null> {
  const row = await db
    .prepare(`SELECT type, name, data, updated_at FROM site_files WHERE key = ?1`)
    .bind(key)
    .first<{ type: string; name: string; data: ArrayBuffer | number[]; updated_at: string }>();
  if (!row) return null;
  // D1 hands blobs back as arrays of bytes.
  const data = Array.isArray(row.data) ? new Uint8Array(row.data).buffer : row.data;
  return { type: row.type, name: row.name, data, updatedAt: row.updated_at };
}
