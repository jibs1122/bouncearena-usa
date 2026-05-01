import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Bounce Arena — Trampoline Reviews & Comparisons";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#ffffff",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: "80px",
        }}
      >
        {/* Teal accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "#38b1ab",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <span style={{ fontSize: "48px", fontWeight: 700, color: "#0a0a0a" }}>
            Bounce Arena
          </span>
        </div>

        <p
          style={{
            fontSize: "28px",
            color: "#444444",
            textAlign: "center",
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          Trampoline Reviews &amp; Comparisons
        </p>
        <p
          style={{
            fontSize: "20px",
            color: "#888888",
            textAlign: "center",
            marginTop: "16px",
          }}
        >
          Independent · ASTM Certified · US Market
        </p>
      </div>
    ),
    { ...size }
  );
}
