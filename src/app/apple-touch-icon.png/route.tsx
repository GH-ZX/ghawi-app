import { ImageResponse } from "next/og";
import { THEMES, logoSvg } from "@/lib/ghstore-ui";
import { storeTheme } from "@/lib/theme";

export const dynamic = "force-static";

/**
 * Home-screen icon. iOS rounds the corners itself, so this is a full square
 * in the preset's dark ground with the GH. mark, as GH Store's app icon.
 */
export function GET() {
  const colours = THEMES[storeTheme.preset].dark;
  const mark = logoSvg({ height: 60, g: colours.accentText, h: "#FFFFFF", dot: colours.dot });
  const src = `data:image/svg+xml;utf8,${encodeURIComponent(mark.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" '))}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: colours.bg }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by next/og, not the browser */}
        <img src={src} width={120} height={60} alt="" />
      </div>
    ),
    { width: 180, height: 180 },
  );
}
