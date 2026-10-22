import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { THEMES, logoSvg } from "@/lib/ghstore-ui";
import { storeTheme } from "@/lib/theme";

/** Rendered once at build: the card is the same for both languages. */
export const dynamic = "force-static";

const OG_SIZE = { width: 1200, height: 630 };

/**
 * The link-preview card (/og.png), in the synced preset's light colours.
 * Its text stays in English for both languages: the image renderer does not
 * shape Arabic script. Referenced from the [lang] layout's metadata.
 */
export async function GET() {
  const c = THEMES[storeTheme.preset].light;
  const mark = logoSvg({ height: 44, g: c.accentText, h: c.ink, dot: c.dot }).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');

  // Prerendered at build, where these files exist. Rubik is the energetic
  // preset's face; the subsets carry Latin only (OFL, from Google Fonts).
  const asset = (name: string) => readFile(join(process.cwd(), "src/assets", name)).catch(() => null);
  const [photo, medium, extraBold] = await Promise.all([
    asset("og-portrait.jpg"),
    asset("Rubik-Medium.ttf"),
    asset("Rubik-ExtraBold.ttf"),
  ]);
  const portrait = photo ? `data:image/jpeg;base64,${photo.toString("base64")}` : null;
  const fonts = [
    ...(medium ? [{ name: "Rubik", data: medium, weight: 500 as const, style: "normal" as const }] : []),
    ...(extraBold ? [{ name: "Rubik", data: extraBold, weight: 800 as const, style: "normal" as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: c.bg,
          backgroundImage: `linear-gradient(135deg, ${c.bg} 0%, ${c.bg} 45%, ${c.tile} 100%)`,
          padding: 56,
          gap: 56,
          color: c.ink,
          fontFamily: "Rubik",
        }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- rendered by next/og */}
            <img src={`data:image/svg+xml;utf8,${encodeURIComponent(mark)}`} width={88} height={44} alt="" />
            <div style={{ display: "flex", fontSize: 26, fontWeight: 500, color: c.muted }}>ghawi.app</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 500, color: c.accentText }}>Ahmed Ghawi</div>
            <div style={{ display: "flex", marginTop: 14, fontSize: 66, fontWeight: 800, lineHeight: 1.04, letterSpacing: -2 }}>
              I build stores, bots and websites that take real money.
            </div>
            <div style={{ display: "flex", marginTop: 22, fontSize: 26, fontWeight: 500, color: c.muted }}>
              Software engineer · Aleppo, Syria
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", borderRadius: 999, background: c.surface, border: `2px solid ${c.line}`, fontSize: 22, fontWeight: 500 }}>
              <div style={{ display: "flex", width: 12, height: 12, borderRadius: 999, background: "#15803D" }} />
              GH Store · live on the web and in Telegram
            </div>
          </div>
        </div>

        {portrait ? (
          <div style={{ display: "flex", width: 360, height: 518, borderRadius: 36, overflow: "hidden", border: `2px solid ${c.line}` }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- rendered by next/og */}
            <img src={portrait} width={360} height={450} style={{ width: 360, height: 518, objectFit: "cover" }} alt="" />
          </div>
        ) : null}
      </div>
    ),
    {
      ...OG_SIZE,
      fonts,
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
    },
  );
}
