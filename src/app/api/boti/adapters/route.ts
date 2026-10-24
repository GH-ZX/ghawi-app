import { validateSpec } from "@/lib/boti/spec";
import { botiGuard, json, logEvent } from "@/lib/boti/server";

export const dynamic = "force-dynamic";

type AdapterRow = { id: string; kind: string; name: string; version: number; spec: string; enabled: number; notes: string | null; updated_at: string };

export async function GET() {
  const auth = await botiGuard();
  if ("response" in auth) return auth.response;
  const rows = (await auth.env.CONTACT_DB?.prepare(`SELECT * FROM boti_adapters ORDER BY kind, name`).all<AdapterRow>())?.results ?? [];
  return json({ adapters: rows.map((row) => ({ ...row, enabled: Boolean(row.enabled), spec: JSON.parse(row.spec) as unknown })) });
}

/**
 * Saves a spec. The version goes up by one on every save of an existing spec
 * (whatever the JSON says), so client bots can tell a spec changed.
 */
export async function POST(request: Request) {
  const auth = await botiGuard();
  if ("response" in auth) return auth.response;
  const db = auth.env.CONTACT_DB;
  if (!db) return json({ error: "no_database" }, 503);

  const body = (await request.json().catch(() => ({}))) as { spec?: unknown; enabled?: boolean; notes?: string };
  let parsed = body.spec;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch (error) {
      return json({ ok: false, errors: [`Not valid JSON: ${(error as Error).message}`] }, 400);
    }
  }
  const current = parsed && typeof parsed === "object" && "id" in parsed
    ? await db.prepare(`SELECT version FROM boti_adapters WHERE id = ?1`).bind(String((parsed as { id: unknown }).id)).first<{ version: number }>()
    : null;
  if (current && parsed && typeof parsed === "object") (parsed as { version: number }).version = current.version + 1;

  const check = validateSpec(parsed);
  if (!check.ok) return json({ ok: false, errors: check.errors }, 400);
  const spec = check.spec;

  await db
    .prepare(
      `INSERT INTO boti_adapters (id, kind, name, version, spec, enabled, notes, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
       ON CONFLICT(id) DO UPDATE SET kind = ?2, name = ?3, version = ?4, spec = ?5, enabled = ?6, notes = ?7, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')`,
    )
    .bind(spec.id, spec.kind, spec.name, spec.version, JSON.stringify(spec), body.enabled ? 1 : 0, (body.notes ?? "").slice(0, 2000) || null)
    .run();
  await logEvent(auth.env, "library.save", null, { id: spec.id, version: spec.version, enabled: Boolean(body.enabled) });
  return json({ ok: true, id: spec.id, version: spec.version });
}

/** Turns a spec on or off without touching it. */
export async function PATCH(request: Request) {
  const auth = await botiGuard();
  if ("response" in auth) return auth.response;
  const body = (await request.json().catch(() => ({}))) as { id?: string; enabled?: boolean };
  if (!body.id) return json({ error: "missing_id" }, 400);
  await auth.env.CONTACT_DB?.prepare(`UPDATE boti_adapters SET enabled = ?2 WHERE id = ?1`).bind(body.id, body.enabled ? 1 : 0).run();
  await logEvent(auth.env, "library.toggle", null, { id: body.id, enabled: Boolean(body.enabled) });
  return json({ ok: true });
}

export async function DELETE(request: Request) {
  const auth = await botiGuard();
  if ("response" in auth) return auth.response;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json({ error: "missing_id" }, 400);
  await auth.env.CONTACT_DB?.prepare(`DELETE FROM boti_adapters WHERE id = ?1`).bind(id).run();
  await logEvent(auth.env, "library.delete", null, { id });
  return json({ ok: true });
}
