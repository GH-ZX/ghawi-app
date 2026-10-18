import { monogramSvg } from "@/lib/invite-mark";

export const dynamic = "force-static";

/** The invitation's browser-tab icon: the couple's logo, ivory on a burgundy disc. */
export function GET() {
  const mark = monogramSvg({ ink: "#FAF6EC", gold: "#FAF6EC", ring: false })
    .replace(/^<svg[^>]*>/, "")
    .replace(/<\/svg>$/, "");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">` +
    `<circle cx="120" cy="120" r="118" fill="#7A1F2B"/>` +
    `<g transform="translate(120 120) scale(0.92) translate(-120 -120)">${mark}</g></svg>`;
  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" },
  });
}
