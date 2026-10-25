import { CLIENT_SLUG, cleanDomain, isFinished, progress, sanitizeState } from "@/lib/boti/setup";
import { botiGuard, errorText, json, logEvent } from "@/lib/boti/server";

export const dynamic = "force-dynamic";

type Row = { name: string; brand: string | null; state: string; progress: number; finished: number; created_at: string; updated_at: string };

/** Quick setup progress: GET lists setups (or one with ?name=), PUT saves one, DELETE removes one. */
export async function GET(request: Request) {
  const auth = await botiGuard();
  if ("response" in auth) return auth.response;
  const db = auth.env.CONTACT_DB;
  if (!db) return json({ setups: [] });

  const name = new URL(request.url).searchParams.get("name");
  try {
    if (name) {
      const row = await db.prepare(`SELECT * FROM boti_setup WHERE name = ?1`).bind(name).first<Row>();
      return json({ setup: row ? { ...row, state: sanitizeState(JSON.parse(row.state)) } : null });
    }
    const rows = await db
      .prepare(`SELECT name, brand, progress, finished, created_at, updated_at FROM boti_setup ORDER BY updated_at DESC LIMIT 50`)
      .all<Omit<Row, "state">>();
    return json({ setups: rows.results });
  } catch (error) {
    return json({ error: errorText(error) }, 500);
  }
}

export async function PUT(request: Request) {
  const auth = await botiGuard();
  if ("response" in auth) return auth.response;
  const db = auth.env.CONTACT_DB;
  if (!db) return json({ error: "no_database" }, 503);

  const body = (await request.json().catch(() => null)) as { state?: unknown } | null;
  const state = sanitizeState(body?.state);
  if (!state) return json({ error: "bad_state" }, 400);
  const name = state.inputs.client;
  if (!CLIENT_SLUG.test(name)) return json({ error: "Client name: 2–31 characters, a-z, 0-9 and -" }, 400);

  try {
    const finished = isFinished(state);
    const before = await db.prepare(`SELECT finished FROM boti_setup WHERE name = ?1`).bind(name).first<{ finished: number }>();
    await db
      .prepare(
        `INSERT INTO boti_setup (name, brand, state, progress, finished) VALUES (?1, ?2, ?3, ?4, ?5)
         ON CONFLICT(name) DO UPDATE SET brand = ?2, state = ?3, progress = ?4, finished = ?5,
           updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
      )
      .bind(name, state.inputs.brand.slice(0, 80) || null, JSON.stringify(state), progress(state), finished ? 1 : 0)
      .run();
    if (finished && !before?.finished) await logEvent(auth.env, "setup.finished", name, { brand: state.inputs.brand });
    return json({ ok: true, progress: progress(state), finished });
  } catch (error) {
    return json({ error: errorText(error) }, 500);
  }
}

export async function DELETE(request: Request) {
  const auth = await botiGuard();
  if ("response" in auth) return auth.response;
  const name = new URL(request.url).searchParams.get("name") ?? "";
  if (!CLIENT_SLUG.test(name)) return json({ error: "bad_name" }, 400);
  try {
    await auth.env.CONTACT_DB?.prepare(`DELETE FROM boti_setup WHERE name = ?1`).bind(name).run();
    return json({ ok: true });
  } catch (error) {
    return json({ error: errorText(error) }, 500);
  }
}

/** POST { action: "health", domain } — is the client's store answering at https://<domain>/health? */
export async function POST(request: Request) {
  const auth = await botiGuard();
  if ("response" in auth) return auth.response;
  const body = (await request.json().catch(() => ({}))) as { action?: string; domain?: string };
  if (body.action !== "health") return json({ error: "unknown_action" }, 400);
  const domain = cleanDomain(String(body.domain ?? ""));
  if (!/^(?=.{3,253}$)[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain)) return json({ error: "bad_domain" }, 400);

  const started = Date.now();
  try {
    const response = await fetch(`https://${domain}/health`, { signal: AbortSignal.timeout(6000), redirect: "follow" });
    return json({ up: response.ok, code: response.status, ms: Date.now() - started });
  } catch {
    return json({ up: false, code: null, ms: null });
  }
}
