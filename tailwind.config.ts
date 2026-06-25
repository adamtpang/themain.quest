import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Priority tag colors (scannable at a glance)
        life: "#ff3b5c",
        health: "#33d17a",
        visa: "#3b82f6",
        taxes: "#f5a623",
        leverage: "#a855f7",
        marketplace: "#22d3ee",
        loops: "#6b7280",
        hud: {
          bg: "#06070d",
          panel: "#0d1018",
          line: "#1c2230",
          dim: "#8a93a6",
          gold: "#ffcf4a",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.18)" },
          "100%": { transform: "scale(1)" },
        },
        flash: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 0px 0px rgba(255,207,74,0.0)" },
          "50%": { boxShadow: "0 0 26px 2px rgba(255,207,74,0.22)" },
        },
      },
      animation: {
        pop: "pop 0.32s ease-out",
        flash: "flash 0.25s ease-out",
        glow: "glow 3.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
