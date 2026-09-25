import { ImageResponse } from "next/og";

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
          background: "#f2f4ef",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid #161a17",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
              color: "#161a17",
            }}
          >
            R
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 4, color: "#161a17" }}>
            RECOURSE
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#161a17",
              lineHeight: 1.15,
              maxWidth: 920,
            }}
          >
            Grounded small claims filings, not generated from memory.
          </div>
          <div style={{ fontSize: 26, color: "#454f49", maxWidth: 880 }}>
            Real statute. Real SC-100 form. Self-verified before you see it.
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div
            style={{
              fontSize: 18,
              letterSpacing: 1,
              color: "#1f5d4e",
              border: "1px solid #b7beb0",
              borderRadius: 20,
              padding: "6px 16px",
            }}
          >
            California · Small claims
          </div>
          <div
            style={{
              fontSize: 18,
              letterSpacing: 1,
              color: "#454f49",
              border: "1px solid #b7beb0",
              borderRadius: 20,
              padding: "6px 16px",
            }}
          >
            LexHack 2026
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
