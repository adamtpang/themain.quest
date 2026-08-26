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
          background: "#241b40",
          padding: "80px",
          color: "#fff7e6",
          fontFamily: "monospace",
        }}
      >
        <div style={{ fontSize: 28, color: "#ffcf4a", letterSpacing: 2 }}>❤️ THE MAIN QUEST</div>
        <div style={{ fontSize: 64, marginTop: 24, lineHeight: 1.15, maxWidth: 900 }}>
          Gamify your life. Close the boss.
        </div>
        <div style={{ fontSize: 28, marginTop: 32, color: "#9bd9ff", maxWidth: 900, lineHeight: 1.4 }}>
          Days become XP. Habits become quests. One life-left clock keeps time honest.
        </div>
      </div>
    ),
    { ...size }
  );
}
