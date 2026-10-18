import { monogramSvg } from "@/lib/invite-mark";

export const dynamic = "force-static";

/** The couple's logo in its ring — burgundy and gold, transparent — for print or anywhere else. */
export function GET() {
  return new Response(monogramSvg({ ink: "#7A1F2B", gold: "#B08A45", size: 960 }), {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" },
  });
}
