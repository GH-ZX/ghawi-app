import { readClients } from "@/lib/boti/github";
import { botiGuard, CLIENT_NAME, errorText, githubFor, json, logEvent } from "@/lib/boti/server";

export const dynamic = "force-dynamic";

type ClientRow = {
  name: string;
  domain: string | null;
  supabase_ref: string | null;
  telegram_bot: string | null;
  notes: string | null;
  library_key_hash: string | null;
  created_at: string;
};

/** GET https://<domain>/health — up/down and how long it took. */
async function siteStatus(domain: string | null): Promise<{ up: boolean | null; ms: number | null; code: number | null }> {
  if (!domain) return { up: null, ms: null, code: null };
  const started = Date.now();
  try {
    const response = await fetch(`https://${domain}/health`, { signal: AbortSignal.timeout(6000), redirect: "follow" });
    return { up: response.ok, ms: Date.now() - started, code: response.status };
  } catch {
    return { up: false, ms: null, code: null };
  }
}

/** The dashboard: every client from clients.json, with what boti knows and their live status. */
export async function GET() {
  const auth = await botiGuard();
  if ("response" in auth) return auth.response;
  const gh = githubFor(auth.env);
  if (!("repo" in gh)) return gh;

  try {
    const [{ clients }, rows, events] = await Promise.all([
      readClients(gh),
      auth.env.CONTACT_DB?.prepare(`SELECT * FROM boti_clients`).all<ClientRow>().then((r) => r.results) ?? Promise.resolve([] as ClientRow[]),
      auth.env.CONTACT_DB?.prepare(`SELECT id, at, kind, client, data FROM boti_events ORDER BY id DESC LIMIT 30`)
        .all<{ id: number; at: string; kind: string; client: string | null; data: string | null }>()
        .then((r) => r.results) ?? Promise.resolve([]),
    ]);
    const byName = new Map(rows.map((row) => [row.name, row]));

    const list = await Promise.all(
      clients.map(async (client) => {
        const row = byName.get(client.name) ?? null;
        const [compare, runs, site] = await Promise.all([
          gh.compare("main", client.branch).catch(() => null),
          gh.runs("sync-client.yml", client.branch, 1).catch(() => []),
          siteStatus(row?.domain ?? null),
        ]);
        return {
          ...client,
          domain: row?.domain ?? null,
          supabase_ref: row?.supabase_ref ?? null,
          telegram_bot: row?.telegram_bot ?? null,
          notes: row?.notes ?? null,
          has_library_key: Boolean(row?.library_key_hash),
          behind: compare?.behind ?? null,
          ahead: compare?.ahead ?? null,
          compare_url: compare ? `https://github.com/${gh.repo}/compare/${client.branch}...main` : null,
          last_sync: runs[0] ?? null,
          site,
        };
      }),
    );

    return json({ repo: gh.repo, clients: list, events });
  } catch (error) {
    return json({ error: errorText(error) }, 502);
  }
}

/** Saves what boti keeps about a client (domain, bot, Supabase ref, notes). */
export async function PATCH(request: Request) {
  const auth = await botiGuard();
  if ("response" in auth) return auth.response;
  const db = auth.env.CONTACT_DB;
  if (!db) return json({ error: "no_database" }, 503);

  const body = (await request.json().catch(() => ({}))) as Partial<ClientRow>;
  const name = String(body.name ?? "");
  if (!CLIENT_NAME.test(name)) return json({ error: "invalid_name" }, 400);
  const clean = (value: unknown, max = 200) => (typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null);
  const domain = clean(body.domain)?.replace(/^https?:\/\//, "").replace(/\/.*$/, "") ?? null;
  const bot = clean(body.telegram_bot)?.replace(/^@/, "") ?? null;

  await db
    .prepare(
      `INSERT INTO boti_clients (name, domain, supabase_ref, telegram_bot, notes) VALUES (?1, ?2, ?3, ?4, ?5)
       ON CONFLICT(name) DO UPDATE SET domain = ?2, supabase_ref = ?3, telegram_bot = ?4, notes = ?5`,
    )
    .bind(name, domain, clean(body.supabase_ref, 40), bot, clean(body.notes, 2000))
    .run();
  await logEvent(auth.env, "client.update", name, { domain, telegram_bot: bot });
  return json({ ok: true });
}
