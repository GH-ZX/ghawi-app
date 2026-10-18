import { inviteDb } from "@/lib/invite-server";

export const dynamic = "force-dynamic";

const DATA_URL = /^data:(image\/(?:png|jpeg|webp|svg\+xml));base64,([A-Za-z0-9+/=]+)$/;

/**
 * The uploaded logo, stored in D1 as a data: URL. The page asks for it
 * with ?v=<save time>, so each version can be cached for good.
 */
export async function GET() {
  const db = await inviteDb();
  const row = db ? await db.prepare(`SELECT value FROM invite_settings WHERE key = 'logo'`).first<{ value: string }>().catch(() => null) : null;
  const match = row ? DATA_URL.exec(row.value) : null;
  if (!match) return new Response("No logo", { status: 404, headers: { "Cache-Control": "no-store" } });

  const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
  return new Response(bytes, {
    headers: {
      "Content-Type": match[1],
      "Cache-Control": "public, max-age=31536000, immutable",
      // An SVG opened on its own must not run anything.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; img-src data:; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
