import { monogramSvg } from "@/lib/invite-mark";

export const dynamic = "force-static";

/** The invitation's browser-tab icon: the monogram on a navy disc. */
export function GET() {
  const mark = monogramSvg({ ink: "#F7F4EE", gold: "#D9BD84", ring: false })
    .replace(/^<svg[^>]*>/, "")
    .replace(/<\/svg>$/, "");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">` +
    `<circle cx="120" cy="120" r="118" fill="#1C2B4B"/>` +
    `<g transform="translate(120 120) scale(1.15) translate(-120 -120)">${mark}</g></svg>`;
  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" },
  });
}
