import { readClients } from "@/lib/boti/github";
import { botiGuard, errorText, githubFor, json, logEvent } from "@/lib/boti/server";

export const dynamic = "force-dynamic";

/**
 * Ships main to the chosen clients: merges main into each client/<name>
 * branch. The push of each merge starts that client's "Sync client repo" run.
 */
export async function POST(request: Request) {
  const auth = await botiGuard();
  if ("response" in auth) return auth.response;
  const gh = githubFor(auth.env);
  if (!("repo" in gh)) return gh;

  const body = (await request.json().catch(() => ({}))) as { clients?: string[] };
  const wanted = new Set((body.clients ?? []).map(String));
  if (!wanted.size) return json({ error: "no_clients" }, 400);

  // Before the merges (they start the runs), with a little slack for GitHub's clock.
  const startedAt = new Date(Date.now() - 30_000).toISOString();
  try {
    const { clients } = await readClients(gh);
    const chosen = clients.filter((c) => wanted.has(c.name));
    const results = [];
    // One at a time: GitHub serialises merges into the same repo anyway.
    for (const client of chosen) {
      try {
        const merge = await gh.merge(client.branch, "main", `Merge main into ${client.branch} (boti.ghawi.app)`);
        results.push({
          name: client.name,
          branch: client.branch,
          result: merge.result,
          sha: merge.sha ?? null,
          compare_url: `https://github.com/${gh.repo}/compare/${client.branch}...main`,
        });
      } catch (error) {
        results.push({ name: client.name, branch: client.branch, result: "error", error: errorText(error) });
      }
    }
    await logEvent(auth.env, "ship", null, results.map((r) => ({ name: r.name, result: r.result })));
    return json({ results, started_at: startedAt });
  } catch (error) {
    return json({ error: errorText(error) }, 502);
  }
}
