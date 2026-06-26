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
        // Land of Ooo palette
        ink: "#241b40", // deep grape, used for all borders + text
        paper: "#fff7e6", // cream panel
        paper2: "#ffeccb", // warmer inset
        sky: "#9bd9ff",
        grass: "#5fbf3a",
        bubblegum: "#ff5fa2",
        gold: "#ffcf4a",
        bmo: "#3fc7b6",
        // Priority tags, re-skinned to Ooo characters
        life: "#ff5d5d", // candy red
        health: "#54c244", // grass green
        visa: "#2f9ee0", // Finn blue
        taxes: "#f6a623", // Jake orange
        leverage: "#a06bff", // LSP lavender
        marketplace: "#2fc2b0", // BMO teal
        loops: "#8b86a3", // Marceline grey
      },
      fontFamily: {
        pixel: ["var(--font-press)", "ui-monospace", "monospace"],
        vt: ["var(--font-vt)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        pix: "4px 4px 0 0 #241b40",
        "pix-sm": "2px 2px 0 0 #241b40",
        "pix-lg": "6px 6px 0 0 #241b40",
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.25)" },
          "100%": { transform: "scale(1)" },
        },
        flash: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
        blink: {
          "0%, 90%, 100%": { opacity: "1" },
          "95%": { opacity: "0.35" },
        },
        shine: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(220%)" },
        },
      },
      animation: {
        pop: "pop 0.32s ease-out",
        flash: "flash 0.25s ease-out",
        bob: "bob 2.4s ease-in-out infinite",
        blink: "blink 3.5s steps(1) infinite",
        shine: "shine 2.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
