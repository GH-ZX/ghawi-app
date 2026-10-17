import { THEMES, iconSvg } from "@/lib/ghstore-ui";
import { storeTheme } from "@/lib/theme";

export const dynamic = "force-static";

/** GH Store's favicon (the hexagon G), in the colours of the synced preset. */
export function GET() {
  const colours = THEMES[storeTheme.preset].dark;
  const svg = iconSvg({ size: 64, simple: true, bg: colours.bg, g: colours.accentText });
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
