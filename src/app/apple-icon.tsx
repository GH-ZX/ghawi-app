import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#07080a",
          border: "10px solid #d4ff3f",
          color: "#edf0f2",
          fontSize: 88,
          fontWeight: 700,
          letterSpacing: -4,
        }}
      >
        G
      </div>
    ),
    size,
  );
}