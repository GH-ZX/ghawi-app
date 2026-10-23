import { NextResponse } from "next/server";
import { requireAdminDb } from "@/lib/invite-server";

/* Admin → Stats: the per-day counters from /api/track, summed over a range. */

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  const auth = await requireAdminDb();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status, headers: noStore });

  const asked = Number(new URL(request.url).searchParams.get("days"));
  const days = [7, 30, 90, 365].includes(asked) ? asked : 30;
  const since = new Date(Date.now() - (days - 1) * 86_400_000).toISOString().slice(0, 10);

  try {
    const [daily, totals, locales, leads] = await Promise.all([
      auth.db
        .prepare(`SELECT day, SUM(count) AS n FROM site_events WHERE kind = 'view' AND day >= ?1 GROUP BY day ORDER BY day`)
        .bind(since)
        .all<{ day: string; n: number }>(),
      auth.db
        .prepare(
          `SELECT kind, label, SUM(count) AS n FROM site_events WHERE day >= ?1
           GROUP BY kind, label ORDER BY n DESC LIMIT 400`,
        )
        .bind(since)
        .all<{ kind: string; label: string; n: number }>(),
      auth.db
        .prepare(`SELECT locale, SUM(count) AS n FROM site_events WHERE kind = 'view' AND day >= ?1 GROUP BY locale`)
        .bind(since)
        .all<{ locale: string; n: number }>(),
      auth.db
        .prepare(`SELECT COUNT(*) AS n FROM contact_messages WHERE created_at >= ?1`)
        .bind(`${since}T00:00:00.000Z`)
        .first<{ n: number }>(),
    ]);

    const group = (kind: string) =>
      totals.results.filter((row) => row.kind === kind).map((row) => ({ label: row.label, n: Number(row.n) }));

    return NextResponse.json(
      {
        days,
        since,
        daily: daily.results.map((row) => ({ day: row.day, n: Number(row.n) })),
        pages: group("view"),
        clicks: group("click"),
        refs: group("ref"),
        countries: group("country"),
        locales: locales.results.map((row) => ({ label: row.locale || "?", n: Number(row.n) })),
        messages: Number(leads?.n ?? 0),
      },
      { headers: noStore },
    );
  } catch {
    return NextResponse.json({ error: "query_failed" }, { status: 500, headers: noStore });
  }
}
