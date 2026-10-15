import { NextResponse } from "next/server";
import { getEnv } from "@/lib/admin-server";

export const dynamic = "force-dynamic";

export const THEMES = ["nocturne", "paper", "ember"] as const;
export type ThemeName = (typeof THEMES)[number];

/** Short edge cache: an admin theme change reaches visitors within a minute. */
const CACHE = "public, max-age=0, s-maxage=60, stale-while-revalidate=300";

/**
 * Public, unauthenticated site configuration. Deliberately narrow — only the
 * theme and the maintenance flag. Never expose contact submissions here.
 */
export async function GET() {
  let theme: ThemeName = "nocturne";
  let landing: "grid" | "film" = "grid";
  let maintenance = "0";
  let note = "";

  try {
    const env = (await getEnv()) as { CONTACT_DB?: D1Database };
    if (env.CONTACT_DB) {
      const rows = await env.CONTACT_DB.prepare(
        `SELECT key, value FROM site_settings
         WHERE key IN ('theme','landing','maintenance','maintenance_note')`,
      )
        .all<{ key: string; value: string | null }>();

      for (const row of rows.results ?? []) {
        if (row.key === "theme") theme = row.value as ThemeName;
        if (row.key === "landing") landing = row.value as "grid" | "film";
        if (row.key === "maintenance") maintenance = row.value ?? "0";
        if (row.key === "maintenance_note") note = row.value ?? "";
      }
    }
  } catch {
    // Fall back to the build-time defaults rather than fail the page.
  }

  return NextResponse.json(
    {
      theme: THEMES.includes(theme) ? theme : "nocturne",
      landing: landing === "film" ? "film" : "grid",
      maintenance,
      note,
    },
    { headers: { "Cache-Control": CACHE } },
  );
}