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
        brand: ["var(--font-brand)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Scala fluida dei titoli: Michroma è un carattere largo, quindi corpi più contenuti.
        "display-sm": ["clamp(1.35rem, 1rem + 1.8vw, 2.25rem)", { lineHeight: "1.18", letterSpacing: "0" }],
        display: ["clamp(1.5rem, 0.8rem + 2.3vw, 3.1rem)", { lineHeight: "1.14", letterSpacing: "0" }],
        "section-title": ["clamp(1.3rem, 0.9rem + 1.7vw, 2.4rem)", { lineHeight: "1.18", letterSpacing: "0" }],
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
