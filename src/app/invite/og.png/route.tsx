import { ImageResponse } from "next/og";
import { monogramSvg } from "@/lib/invite-mark";

/** Rendered once at build: the same card for every guest; the title carries their name. */
export const dynamic = "force-static";

const MOTES = [
  [90, 120, 6], [210, 470, 4], [330, 90, 5], [980, 140, 6], [1100, 420, 4],
  [880, 540, 5], [160, 300, 3], [1040, 260, 3], [420, 560, 4], [760, 70, 4],
] as const;

/**
 * The link preview WhatsApp and Telegram show: the أ إ monogram in ivory
 * and gold on navy, framed like the envelope. No words — the image renderer
 * can't join Arabic letters, and the monogram's are drawn as shapes.
 */
export function GET() {
  const mark = monogramSvg({ ink: "#F7F4EE", gold: "#D9BD84", size: 420 });
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "radial-gradient(circle at 50% 45%, #2a3f6e 0%, #1c2b4b 45%, #121d36 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 28,
            left: 28,
            right: 28,
            bottom: 28,
            border: "1.5px solid rgba(217,189,132,0.55)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            right: 40,
            bottom: 40,
            border: "1px solid rgba(217,189,132,0.3)",
            display: "flex",
          }}
        />
        {MOTES.map(([x, y, r], i) => (
          <div
            key={i}
            style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, borderRadius: r, background: "rgba(217,189,132,0.75)" }}
          />
        ))}
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by next/og */}
        <img src={`data:image/svg+xml;utf8,${encodeURIComponent(mark)}`} width={420} height={420} alt="" />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
