import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Bebas Neue'", "cursive"],
        heading: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        void: "#050507",
        obsidian: "#0a0a0f",
        carbon: "#111118",
        steel: "#1a1a24",
        iron: "#222230",
        slate: "#2d2d3d",
        mist: "#3d3d52",
        ash: "#6b6b8a",
        silver: "#9999bb",
        snow: "#e8e8f0",
        ghost: "#f5f5fa",
        ember: "#ff4444",
        fire: "#ff6b00",
        gold: "#ffd700",
        electric: "#00d4ff",
        neon: "#00ff88",
        violet: "#8b5cf6",
        crimson: "#dc2626",
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        "slide-in-right": "slideInRight 0.3s ease forwards",
        "glow": "glow 2s ease-in-out infinite alternate",
        "streak-burn": "streakBurn 1s ease forwards",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { transform: "translateY(20px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        slideInRight: { "0%": { transform: "translateX(20px)", opacity: "0" }, "100%": { transform: "translateX(0)", opacity: "1" } },
        glow: { "0%": { boxShadow: "0 0 5px #ff6b00, 0 0 10px #ff6b00" }, "100%": { boxShadow: "0 0 20px #ff6b00, 0 0 40px #ff6b00, 0 0 60px #ff4444" } },
        streakBurn: { "0%": { transform: "scale(0.8)", opacity: "0" }, "50%": { transform: "scale(1.1)" }, "100%": { transform: "scale(1)", opacity: "1" } },
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(255,107,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,0.03) 1px, transparent 1px)",
        "ember-gradient": "linear-gradient(135deg, #ff4444 0%, #ff6b00 50%, #ffd700 100%)",
        "void-gradient": "linear-gradient(180deg, #050507 0%, #0a0a0f 100%)",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
    },
  },
  plugins: [],
};

export default config;
