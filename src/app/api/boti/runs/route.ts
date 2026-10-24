import { botiGuard, errorText, githubFor, json } from "@/lib/boti/server";

export const dynamic = "force-dynamic";

/** Latest "Sync client repo" run per branch: GET ?branches=client/a,client/b (max 10). */
export async function GET(request: Request) {
  const auth = await botiGuard();
  if ("response" in auth) return auth.response;
  const gh = githubFor(auth.env);
  if (!("repo" in gh)) return gh;

  const branches = (new URL(request.url).searchParams.get("branches") ?? "")
    .split(",")
    .map((b) => b.trim())
    .filter((b) => /^client\/[a-z0-9][a-z0-9-]*$/.test(b))
    .slice(0, 10);

  try {
    const entries = await Promise.all(
      branches.map(async (branch) => [branch, (await gh.runs("sync-client.yml", branch, 1))[0] ?? null] as const),
    );
    return json({ runs: Object.fromEntries(entries) });
  } catch (error) {
    return json({ error: errorText(error) }, 502);
  }
}
