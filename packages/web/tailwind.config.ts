import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cyber: {
          black: "#030303",
          gray: "#121212",
          dark: "#0A0A0A",
          muted: "#333333",
          text: "#E0E0E0",
          "text-muted": "#888888",
        },
        neon: {
          green: "#00FF9D",
          pink: "#FF0055",
          blue: "#00F0FF",
          purple: "#B026FF",
          yellow: "#FAFF00",
        },
      },
      fontFamily: {
        display: ["var(--font-syncopate)", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
      backgroundImage: {
        'cyber-grid': "linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)",
        'cyber-gradient': "linear-gradient(135deg, rgba(0,255,157,0.1) 0%, rgba(0,0,0,0) 100%)",
      },
      backgroundSize: {
        'grid-sm': '20px 20px',
      },
      boxShadow: {
        'neon-green': '0 0 10px rgba(0, 255, 157, 0.5), 0 0 20px rgba(0, 255, 157, 0.3)',
        'neon-blue': '0 0 10px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.3)',
        'neon-pink': '0 0 10px rgba(255, 0, 85, 0.5), 0 0 20px rgba(255, 0, 85, 0.3)',
      },
      animation: {
        "pulse-fast": "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scanline": "scanline 8s linear infinite",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
