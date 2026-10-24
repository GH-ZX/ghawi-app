import { NextResponse } from "next/server";
import { getEnv } from "@/lib/admin-server";
import { safeEqual, sha256Hex } from "@/lib/boti/crypto";

export const dynamic = "force-dynamic";

/**
 * The API library for client bots: GET with "Authorization: Bearer <library key>".
 * Returns every enabled adapter spec. Each client has its own key (boti → New
 * client → Keys); only its SHA-256 is stored here.
 */
export async function GET(request: Request) {
  const env = ((await getEnv()) ?? {}) as { CONTACT_DB?: D1Database };
  const db = env.CONTACT_DB;
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
  if (!db) return NextResponse.json({ error: "unavailable" }, { status: 503, headers });

  const key = /^Bearer\s+(\S+)$/i.exec(request.headers.get("authorization") ?? "")?.[1] ?? "";
  if (!key || key.length > 200) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers });

  const hash = await sha256Hex(key);
  const client = await db.prepare(`SELECT name, library_key_hash FROM boti_clients WHERE library_key_hash = ?1`).bind(hash).first<{ name: string; library_key_hash: string }>();
  if (!client || !safeEqual(client.library_key_hash, hash)) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers });

  const rows = (await db.prepare(`SELECT id, kind, version, spec, updated_at FROM boti_adapters WHERE enabled = 1 ORDER BY kind, id`).all<{ id: string; kind: string; version: number; spec: string; updated_at: string }>()).results;
  return NextResponse.json(
    {
      client: client.name,
      adapters: rows.map((row) => ({ id: row.id, kind: row.kind, version: row.version, updated_at: row.updated_at, spec: JSON.parse(row.spec) as unknown })),
    },
    { headers },
  );
}
