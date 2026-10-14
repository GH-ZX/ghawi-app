import { ImageResponse } from "next/og";

export const alt = "Ahmed Ghawi — Software Engineer & IT Systems Specialist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#07080a",
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        {/* Accent wash bleeding down from the top edge. A linear gradient —
            Satori renders radial stops on non-square boxes with a seam. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 360,
            backgroundImage:
              "linear-gradient(to bottom, rgba(212,255,63,0.11), rgba(212,255,63,0.04) 45%, rgba(212,255,63,0) 80%)",
            display: "flex",
          }}
        />

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 44,
                height: 44,
                border: "1px solid rgba(255,255,255,0.18)",
                backgroundColor: "#0f1216",
                color: "#edf0f2",
                fontSize: 19,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              GH
            </div>
            <div
              style={{
                color: "#67717a",
                fontSize: 20,
                letterSpacing: 4,
                display: "flex",
              }}
            >
              ghawi.app
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                backgroundColor: "#d4ff3f",
                display: "flex",
              }}
            />
            <div style={{ color: "#d4ff3f", fontSize: 18, letterSpacing: 3, display: "flex" }}>
              LIVE
            </div>
          </div>
        </div>

        {/* Name */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 132,
              lineHeight: 1,
              fontWeight: 600,
              letterSpacing: -5,
              color: "#edf0f2",
            }}
          >
            Ahmed Ghawi
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 26,
              letterSpacing: 3,
              color: "#9ba5ad",
            }}
          >
            SOFTWARE ENGINEER · IT SYSTEMS SPECIALIST
          </div>

          <div style={{ display: "flex", marginTop: 34, width: 220, height: 5, backgroundColor: "#d4ff3f" }} />
        </div>

        {/* Footer row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: 28,
          }}
        >
          <div style={{ color: "#67717a", fontSize: 20, letterSpacing: 2, display: "flex" }}>
            GH STORE · BOT FACTORY
          </div>
          <div style={{ color: "#67717a", fontSize: 20, letterSpacing: 2, display: "flex" }}>
            ALEPPO, SYRIA · UTC+3
          </div>
        </div>
      </div>
    ),
    size,
  );
}