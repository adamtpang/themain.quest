import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Hero Meadow palette
        ink: "#07150a",
        paper: "#f3f8e5",
        paper2: "#e7ecda",
        sky: "#89d8ff",
        grass: "#68db70",
        blossom: "#ff5fa2",
        gold: "#ffcf4a",
        stream: "#3fc7b6",
        // Priority tags use the same bright meadow world.
        life: "#ff5d5d",
        health: "#54c244",
        visa: "#2f9ee0",
        taxes: "#f6a623",
        leverage: "#a06bff",
        marketplace: "#2fc2b0",
        loops: "#8b86a3",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        pixel: ["var(--font-press)", "ui-monospace", "monospace"],
        vt: ["var(--font-vt)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "brand-bg": "var(--gradient-bg)",
        "brand-accent": "var(--gradient-accent)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        pix: "4px 4px 0 0 #07150a",
        "pix-sm": "2px 2px 0 0 #07150a",
        "pix-lg": "6px 6px 0 0 #07150a",
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
  plugins: [animate],
};

export default config;
