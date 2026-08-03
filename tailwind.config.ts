import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        "foreground-muted": "var(--color-foreground-muted)",
        accent: "var(--color-accent)",
        "accent-hover": "var(--color-accent-hover)",
        border: "var(--color-border)",
        surface: "var(--color-surface)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-sm": ["clamp(2rem, 4vw, 3rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        display: ["clamp(2.5rem, 5vw, 5rem)", { lineHeight: "1.02", letterSpacing: "-0.035em" }],
        "section-title": ["clamp(2rem, 4vw, 3.25rem)", { lineHeight: "1.06", letterSpacing: "-0.03em" }],
        "section-subtitle": ["clamp(1.25rem, 2vw, 1.75rem)", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
      },
      maxWidth: {
        container: "76rem",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        marquee: "marquee var(--marquee-duration, 40s) linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
