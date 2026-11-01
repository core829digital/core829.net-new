import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  future: {
    // Gli stati :hover si applicano solo ai dispositivi con vero hover:
    // niente hover "appiccicati" al tocco su telefoni e tablet.
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        // Canali RGB + <alpha-value>: abilitano i modificatori di opacità (/20).
        background: "rgb(var(--rgb-background) / <alpha-value>)",
        foreground: "rgb(var(--rgb-foreground) / <alpha-value>)",
        "foreground-muted": "rgb(var(--rgb-foreground-muted) / <alpha-value>)",
        accent: "rgb(var(--rgb-accent) / <alpha-value>)",
        "accent-hover": "rgb(var(--rgb-accent-hover) / <alpha-value>)",
        border: "rgb(var(--rgb-border) / <alpha-value>)",
        surface: "rgb(var(--rgb-surface) / <alpha-value>)",
        ink: "rgb(var(--rgb-ink) / <alpha-value>)",
        "ink-soft": "rgb(var(--rgb-ink-soft) / <alpha-value>)",
        "on-ink": "rgb(var(--rgb-on-ink) / <alpha-value>)",
        "on-ink-muted": "rgb(var(--rgb-on-ink-muted) / <alpha-value>)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        lift: "var(--shadow-lift)",
      },
      transitionTimingFunction: {
        "out-expo": "var(--ease-out-expo)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Scala fluida pensata per Unbounded (largo): più contenuta dell'Inter di prima.
        "display-sm": ["clamp(1.75rem, 1.2rem + 2.6vw, 3rem)", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
        display: ["clamp(1.9rem, 0.9rem + 3.1vw, 4.1rem)", { lineHeight: "1.06", letterSpacing: "-0.03em" }],
        "section-title": ["clamp(1.65rem, 1rem + 2.4vw, 3.25rem)", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
        "section-subtitle": ["clamp(1.15rem, 0.9rem + 1vw, 1.75rem)", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
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
