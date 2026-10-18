import { monogramSvg } from "@/lib/invite-mark";

export const dynamic = "force-static";

/** The أ إ monogram on its own — navy and gold, transparent — for print or anywhere else. */
export function GET() {
  return new Response(monogramSvg({ ink: "#1C2B4B", gold: "#B08A45", size: 960 }), {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" },
  });
}
