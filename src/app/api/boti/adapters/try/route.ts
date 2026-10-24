import { applyMap, buildRequest, specEndpoints, validateSpec } from "@/lib/boti/spec";
import { botiGuard, errorText, json } from "@/lib/boti/server";

export const dynamic = "force-dynamic";

/**
 * "Try it": runs one endpoint of a spec from the server with a token typed in
 * the form. The token is used for this one request and never stored or logged.
 */
export async function POST(request: Request) {
  const auth = await botiGuard();
  if ("response" in auth) return auth.response;

  const body = (await request.json().catch(() => ({}))) as {
    spec?: unknown;
    endpoint?: string;
    token?: string;
    base_url?: string;
    vars?: Record<string, string>;
  };
  let parsed = body.spec;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return json({ ok: false, error: "The spec is not valid JSON." }, 400);
    }
  }
  const check = validateSpec(parsed);
  if (!check.ok) return json({ ok: false, error: "Fix the spec first.", errors: check.errors }, 400);
  const target = specEndpoints(check.spec).find((e) => e.name === body.endpoint);
  if (!target) return json({ ok: false, error: "Unknown endpoint." }, 400);

  const base = (body.base_url ?? "").trim() || check.spec.base_url;
  if (!/^https:\/\//.test(base)) return json({ ok: false, error: "The base URL must be https." }, 400);

  const vars = Object.fromEntries(Object.entries(body.vars ?? {}).map(([k, v]) => [k, String(v).slice(0, 500)]));
  const { url, init } = buildRequest(check.spec, target.endpoint, String(body.token ?? ""), vars, base);
  const started = Date.now();
  try {
    const response = await fetch(url, { ...init, signal: AbortSignal.timeout(15_000), redirect: "manual" });
    const text = await response.text();
    let data: unknown = text;
    try {
      data = JSON.parse(text);
    } catch {
      // not JSON: show the text
    }
    const mapped = typeof data === "object" ? applyMap(data, target.endpoint) : [];
    const token = String(body.token ?? "");
    // Never echo the token back, even if the API put it in its reply or the URL has it.
    const shownUrl = token ? url.split(token).join("•••") : url;
    const raw = typeof text === "string" ? (token ? text.split(token).join("•••") : text).slice(0, 4000) : "";
    return json({
      ok: response.ok,
      status: response.status,
      ms: Date.now() - started,
      request: { method: init.method, url: shownUrl },
      mapped: mapped.slice(0, 20),
      mapped_count: mapped.length,
      raw,
    });
  } catch (error) {
    return json({ ok: false, error: errorText(error) }, 502);
  }
}
