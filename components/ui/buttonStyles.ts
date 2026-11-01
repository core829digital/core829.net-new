import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonTone = "light" | "dark";

/**
 * Pulsante a capsula (Apple HIG): area minima 44px, materiale vetro definito in
 * globals.css (.btn + variante), stato di pressione e hover solo di colore.
 * - primary   = "prominent": usare al massimo 1-2 per vista
 * - secondary = vetro neutro
 * - ghost     = solo testo/evidenziazione
 * - tone="dark" per i pulsanti sopra sfondi scuri
 */
const base =
  "btn inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-medium focus-visible:outline-none";

const variants: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
};

/** Classi del bottone, riusabili su elementi diversi (es. <Link> localizzato). */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  className?: string,
  tone: ButtonTone = "light"
) {
  return cn(base, variants[variant], tone === "dark" && "btn-on-dark", className);
}

