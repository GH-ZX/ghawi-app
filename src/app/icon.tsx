import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          color: "#d4ff3f",
          fontSize: 19,
          fontWeight: 700,
          letterSpacing: -1,
        }}
      >
        G
      </div>
    ),
    size,
  );
}