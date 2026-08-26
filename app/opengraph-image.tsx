import { ImageResponse } from "next/og";

export const alt = "The Main Quest: Gamify Your Life";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          background: "linear-gradient(135deg, #f3f8e5 0%, #d8f4ff 100%)",
          padding: "80px",
          color: "#07150a",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "4px solid #07150a",
            borderRadius: 999,
            background: "#ffcf4a",
            boxShadow: "6px 7px 0 #07150a",
            padding: "14px 24px",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          🧭 THE MAIN QUEST
        </div>
        <div style={{ fontSize: 68, fontWeight: 700, marginTop: 36, lineHeight: 1.08, maxWidth: 900 }}>
          Gamify your life. Close the boss.
        </div>
        <div style={{ fontSize: 28, marginTop: 32, color: "#00641a", maxWidth: 900, lineHeight: 1.4 }}>
          Days become XP. Habits become quests. One life-left clock keeps time honest.
        </div>
      </div>
    ),
    { ...size }
  );
}
