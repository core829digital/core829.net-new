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
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        "foreground-muted": "var(--color-foreground-muted)",
        accent: "var(--color-accent)",
        "accent-hover": "var(--color-accent-hover)",
        border: "var(--color-border)",
        surface: "var(--color-surface)",
        ink: "var(--color-ink)",
        "ink-soft": "var(--color-ink-soft)",
        "on-ink": "var(--color-on-ink)",
        "on-ink-muted": "var(--color-on-ink-muted)",
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
