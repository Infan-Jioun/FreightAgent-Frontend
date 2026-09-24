// app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const alt = "FreightAgent | Next-Gen AI Freight & Global Logistics Management";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 70px",
          backgroundColor: "#0a0f0f",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(0, 201, 167, 0.22), transparent 45%), radial-gradient(circle at 15% 85%, rgba(0, 180, 216, 0.15), transparent 45%)",
          color: "#e0faf5",
          fontFamily: "system-ui, -apple-system, sans-serif",
          border: "2px solid #1a3330",
        }}
      >
        {/* Top Header / Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: "#00c9a7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0a0f0f",
                fontWeight: 900,
                fontSize: "24px",
              }}
            >
              FA
            </div>
            <div style={{ display: "flex", alignItems: "center", fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px" }}>
              <span>Freight</span>
              <span style={{ color: "#00c9a7" }}>Agent</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              borderRadius: "999px",
              backgroundColor: "rgba(0, 201, 167, 0.12)",
              border: "1px solid rgba(0, 201, 167, 0.3)",
              fontSize: "14px",
              fontWeight: 700,
              color: "#00e5c0",
              letterSpacing: "0.5px",
            }}
          >
            ENTERPRISE LOGISTICS INTELLIGENCE
          </div>
        </div>

        {/* Center Hero */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "980px" }}>
          <div
            style={{
              display: "flex",
              fontSize: "52px",
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
              color: "#ffffff",
            }}
          >
            Autonomous Multi-Modal Freight & Real-Time Global Telematics
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "22px",
              lineHeight: 1.45,
              color: "#7ecfc4",
              fontWeight: 500,
            }}
          >
            Ocean Liner Alliances • Air Cargo Charters • Cross-Border Drayage • Automated Customs Clearance
          </div>
        </div>

        {/* Bottom Metrics Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "24px",
            borderTop: "1px solid #1a3330",
          }}
        >
          <div style={{ display: "flex", gap: "48px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "24px", fontWeight: 800, color: "#00e5c0" }}>140+</span>
              <span style={{ fontSize: "12px", color: "#5ea39b", textTransform: "uppercase" }}>Countries Served</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "24px", fontWeight: 800, color: "#00e5c0" }}>2.5M+</span>
              <span style={{ fontSize: "12px", color: "#5ea39b", textTransform: "uppercase" }}>TEU Managed</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "24px", fontWeight: 800, color: "#00e5c0" }}>99.4%</span>
              <span style={{ fontSize: "12px", color: "#5ea39b", textTransform: "uppercase" }}>On-Time Dispatch SLA</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: "16px",
              color: "#00c9a7",
              fontWeight: 700,
            }}
          >
            freightagent.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
