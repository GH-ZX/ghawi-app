import { redirect } from "next/navigation";
import { getEnv } from "@/lib/admin-server";
import { defaultLocale } from "@/lib/content";

/**
 * The front door.
 *
 * Reads the admin's `landing` setting and forwards to whichever design is
 * live. Dynamic on purpose — it is a single indexed lookup on a redirect, and
 * it is the only place in the app that has to run per request to honour the
 * setting. Both destinations stay fully prerendered and directly addressable
 * (`/en` is always the grid design, `/film/en` is always Film), so switching
 * costs nothing and loses nothing.
 */
export const dynamic = "force-dynamic";

const ROUTES: Record<string, string> = {
  grid: `/${defaultLocale}`,
  film: `/film/${defaultLocale}`,
  atlas: `/atlas/${defaultLocale}`,
};

export default async function RootPage() {
  let landing = "grid";

  try {
    const env = (await getEnv()) as { CONTACT_DB?: D1Database };
    if (env.CONTACT_DB) {
      const row = await env.CONTACT_DB.prepare(
        `SELECT value FROM site_settings WHERE key = 'landing'`,
      ).first<{ value: string | null }>();
      // Unknown values fall through to the default rather than redirecting
      // into a path that may not exist.
      if (row?.value && row.value in ROUTES) landing = row.value;
    }
  } catch {
    // A lookup failure must never take the site down — serve the default.
  }

  redirect(ROUTES[landing]);
}