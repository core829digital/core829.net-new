"use client";

import { useState } from "react";
import { useImageLoop } from "@/lib/useImageLoop";
import { cn } from "@/lib/utils";

interface ClientScreenshotProps {
  /** Una o più immagini (1920×960). Più immagini = carousel in loop. */
  srcs: string[];
  alt: string;
  className?: string;
  /** Dominio mostrato nella barra "browser" in alto (opzionale). */
  domain?: string;
  /** Intervallo del carousel in ms (default 4500). */
  intervalMs?: number;
}

/**
 * Screenshot reali di un progetto cliente, in frame minimale premium.
 * - Un'immagine: rapporto naturale, nessun crop.
 * - Più immagini: carousel in loop con dissolvenza e indicatori; pausa su
 *   hover/focus, fermo con prefers-reduced-motion.
 * Usa <img> nativo: nessun `fill`/lazy che possa nascondere l'immagine.
 */
export default function ClientScreenshot({
  srcs,
  alt,
  className,
  domain,
  intervalMs = 4500,
}: ClientScreenshotProps) {
  const multi = srcs.length > 1;
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useImageLoop(srcs, intervalMs, paused);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-surface shadow-soft",
        className
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {domain && (
        <div
          aria-hidden
          className="flex items-center gap-3 border-b border-border bg-background px-3 py-2"
        >
          <span className="flex gap-1.5">
            <span className="h-2 w-2 bg-border" />
            <span className="h-2 w-2 bg-border" />
            <span className="h-2 w-2 bg-border" />
          </span>
          <span className="truncate font-mono text-[11px] uppercase tracking-[0.2em] text-foreground-muted">
            {domain}
          </span>
        </div>
      )}

      {multi ? (
        <div className="relative aspect-[2/1]">
          {srcs.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={i === active ? alt : ""}
              aria-hidden={i !== active}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              className={cn(
                "absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-700 motion-reduce:transition-none",
                i === active ? "opacity-100" : "opacity-0"
              )}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-gradient-to-t from-black/25 to-transparent pb-1 pt-6">
            {srcs.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`${i + 1} / ${srcs.length}`}
                aria-current={i === active}
                className="flex min-h-11 min-w-8 items-center justify-center"
              >
                <span
                  className={cn(
                    "block h-0.5 transition-all duration-500",
                    i === active ? "w-8 bg-accent" : "w-5 bg-white/70"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={srcs[0]}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full object-cover object-top transition-transform duration-700 hover:scale-[1.02]"
        />
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-foreground/10"
      />
    </div>
  );
}
